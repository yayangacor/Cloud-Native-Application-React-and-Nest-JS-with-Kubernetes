

# Create a resource group
resource "azurerm_resource_group" "main" {
  name     = "${var.n}-rg"
  location = "centraljakarta"
}

# Create a virtual network within the resource group
resource "azurerm_virtual_network" "main" {
  name                = "${var.n}-vnet"
  resource_group_name = azurerm_resource_group.main.name
  location            = azurerm_resource_group.main.location
  address_space       = ["10.0.0.0/16"]
}

resource "azurerm_subnet" "main" {
  name                 = "${var.n}-aks-sn"
  resource_group_name  = azurerm_resource_group.main.name
  virtual_network_name = azurerm_virtual_network.main.name
  address_prefixes     = ["10.0.1.0/24"]
}

resource "azurerm_subnet" "aks" {
  name                 = "${var.n}-aks-sn"
  resource_group_name  = azurerm_resource_group.main.name
  virtual_network_name = azurerm_virtual_network.main.name
  address_prefixes     = ["10.0.2.0/24"]
}

resource "azurerm_private_dns_zone" "dns" {
  name                = "privatelink.mysql.database.azure.com"
  resource_group_name = azurerm_resource_group.main.name
}

resource "azurerm_private_dns_zone_virtual_network_link" "dns" {
  name                = "privatelink.mysql.database.azure.com"
  private_dns_zone_id = azurerm_private_dns_zone.dns.id
  virtual_network_id  = azurerm_virtual_network.main.id
}

resource "azurerm_mysql_flexible_server" "fs" {
  name                   = "${var.n}-flexible-server"
  resource_group_name    = azurerm_resource_group.main.name
  location               = azurerm_resource_group.main.location
  administrator_login    = "WY"
  administrator_password = "WY123456!"
  sku_name               = "B_Standard_B1ms"
  public_network_access = "Disabled"
  version = "8.0.21"
}

resource "azurerm_mysql_flexible_database" "fd" {
  name                = "${var.n}-db"
  resource_group_name = azurerm_resource_group.main.name
  server_name         = azurerm_mysql_flexible_server.fs.name
  charset             = "utf8"
  collation           = "utf8_unicode_ci"
}

resource "azurerm_private_endpoint" "example" {
  name                = "example-endpoint"
  location            = azurerm_resource_group.main.location
  resource_group_name = azurerm_resource_group.main.name
  subnet_id           = azurerm_subnet.aks.id

  private_service_connection {
    name                           = "example-privateserviceconnection"
    private_connection_resource_id = azurerm_mysql_flexible_server.fs.id
    subresource_names              = ["blob"]
    is_manual_connection           = false
  }

  private_dns_zone_group {
    name                 = "example-dns-zone-group"
    private_dns_zone_ids = [azurerm_private_dns_zone.dns.id]
  }
}

resource "azurerm_container_registry" "acr" {
  name                = "${var.n}acr"
  resource_group_name = azurerm_resource_group.main.name
  location            = azurerm_resource_group.main.location
  sku                 = "Standard"
  admin_enabled       = false
  anonymous_pull_enabled = true
}

resource "azurerm_kubernetes_cluster" "example" {
  name                = "${var.n}-aks"
  location            = azurerm_resource_group.main.location
  resource_group_name = azurerm_resource_group.main.name
  dns_prefix          = "exampleaks1"

    node_provisioning_profile {
      mode = "Manual"
    }

  default_node_pool {
    name       = "default"
    node_count = 1
    vm_size    = "Standard_D2_v3"
    vnet_subnet_id = azurerm_subnet.aks.id
  }

  network_profile {
    service_cidr = "10.1.0.0/24"
    dns_service_ip = "10.1.0.10"
    network_plugin = "kubenet"
  }

  identity {
    type = "SystemAssigned"
  }

  tags = {
    Environment = "Production"
  }
}