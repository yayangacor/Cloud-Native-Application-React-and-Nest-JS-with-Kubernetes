# Create a resource group
resource "azurerm_resource_group" "main" {
  name     = "${var.n}-rg"
  location = var.location
}

# Create a virtual network with one subnet for AKS and one for the database private endpoint
resource "azurerm_virtual_network" "main" {
  name                = "${var.n}-vnet"
  resource_group_name = azurerm_resource_group.main.name
  location            = azurerm_resource_group.main.location
  address_space       = ["10.0.0.0/16"]
}

resource "azurerm_subnet" "aks" {
  name                 = "${var.n}-aks-sn"
  resource_group_name  = azurerm_resource_group.main.name
  virtual_network_name = azurerm_virtual_network.main.name
  address_prefixes     = ["10.0.1.0/24"]
}

resource "azurerm_subnet" "pe" {
  name                 = "${var.n}-pe-sn"
  resource_group_name  = azurerm_resource_group.main.name
  virtual_network_name = azurerm_virtual_network.main.name
  address_prefixes     = ["10.0.2.0/24"]
}

# Private DNS zone so the MySQL hostname resolves to the private endpoint IP inside the VNet
resource "azurerm_private_dns_zone" "dns" {
  name                = "privatelink.mysql.database.azure.com"
  resource_group_name = azurerm_resource_group.main.name
}

resource "azurerm_private_dns_zone_virtual_network_link" "dns" {
  name                = "${var.n}-mysql-dns-link"
  private_dns_zone_id = azurerm_private_dns_zone.dns.id
  virtual_network_id  = azurerm_virtual_network.main.id
}

# Azure Database for MySQL with public access disabled
resource "azurerm_mysql_flexible_server" "db" {
  name                   = "${var.n}-db"
  resource_group_name    = azurerm_resource_group.main.name
  location               = azurerm_resource_group.main.location
  administrator_login    = var.db_admin_login
  administrator_password = var.db_admin_password
  sku_name               = "B_Standard_B1ms"
  version                = "8.0.21"
  public_network_access  = "Disabled"
}

resource "azurerm_mysql_flexible_database" "app" {
  name                = "wspeedrun"
  resource_group_name = azurerm_resource_group.main.name
  server_name         = azurerm_mysql_flexible_server.db.name
  charset             = "utf8mb4"
  collation           = "utf8mb4_unicode_ci"
}

# Private endpoint for MySQL in the private endpoint subnet
resource "azurerm_private_endpoint" "db" {
  name                = "${var.n}-db-pe"
  location            = azurerm_resource_group.main.location
  resource_group_name = azurerm_resource_group.main.name
  subnet_id           = azurerm_subnet.pe.id

  private_service_connection {
    name                           = "${var.n}-db-psc"
    private_connection_resource_id = azurerm_mysql_flexible_server.db.id
    subresource_names              = ["mysqlServer"]
    is_manual_connection           = false
  }

  private_dns_zone_group {
    name                 = "${var.n}-db-dns"
    private_dns_zone_ids = [azurerm_private_dns_zone.dns.id]
  }
}

# Container registry, AKS pulls from it through the AcrPull role below
resource "azurerm_container_registry" "acr" {
  name                = "${var.n}acr"
  resource_group_name = azurerm_resource_group.main.name
  location            = azurerm_resource_group.main.location
  sku                 = "Standard"
  admin_enabled       = false
}

resource "azurerm_kubernetes_cluster" "aks" {
  name                = "${var.n}-aks"
  location            = azurerm_resource_group.main.location
  resource_group_name = azurerm_resource_group.main.name
  dns_prefix          = "aks-${var.n}"

  node_provisioning_profile {
    mode = "Manual"
  }

  default_node_pool {
    name           = "default"
    node_count     = 1
    vm_size        = "Standard_D2s_v4"
    vnet_subnet_id = azurerm_subnet.aks.id
  }

  network_profile {
    network_plugin      = "azure"
    network_plugin_mode = "overlay"
    pod_cidr            = "10.244.0.0/16"
    service_cidr        = "10.1.0.0/24"
    dns_service_ip      = "10.1.0.10"
  }

  identity {
    type = "SystemAssigned"
  }

  # Application routing add-on (managed NGINX ingress controller with a public IP)
  web_app_routing {
    dns_zone_ids = []
  }

  tags = {
    Environment = "Production"
  }
}

# Let AKS manage networking in its own subnet
resource "azurerm_role_assignment" "aks_network" {
  scope                = azurerm_subnet.aks.id
  role_definition_name = "Network Contributor"
  principal_id         = azurerm_kubernetes_cluster.aks.identity[0].principal_id
}

# Let the AKS nodes pull images from ACR
resource "azurerm_role_assignment" "acr_pull" {
  scope                            = azurerm_container_registry.acr.id
  role_definition_name             = "AcrPull"
  principal_id                     = azurerm_kubernetes_cluster.aks.kubelet_identity[0].object_id
  skip_service_principal_aad_check = true
}
