output "acr_login_server" {
  value = azurerm_container_registry.acr.login_server
}

output "aks_name" {
  value = azurerm_kubernetes_cluster.aks.name
}

output "mysql_fqdn" {
  value = azurerm_mysql_flexible_server.db.fqdn
}

output "mysql_private_ip" {
  value = azurerm_private_endpoint.db.private_service_connection[0].private_ip_address
}
