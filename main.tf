terraform {
  required_providers {
    azurerm = {
      source  = "hashicorp/azurerm"
      version = "3.0.0"
    }
  }
}

provider "azurerm" {
  features {}
}

variable "db_admin_user" {}
variable "db_admin_password" {}

resource "azurerm_resource_group" "squaremarket-group" {
  name     = "squaremarket-group"
  location = "North Europe"

  tags = {
    "environment" = "production"
    "source"      = "terraform"
  }
}

resource "azurerm_container_registry" "acr" {
  name                = "squaremarketacr"
  resource_group_name = azurerm_resource_group.squaremarket-group.name
  location            = azurerm_resource_group.squaremarket-group.location
  sku                 = "Basic"
  admin_enabled       = false

  tags = {
    "environment" = "production"
    "source"      = "terraform"
  }
}

resource "azurerm_kubernetes_cluster" "api" {
  name                = "squaremarket-aks"
  kubernetes_version  = "1.28.0"
  location            = azurerm_resource_group.squaremarket-group.location
  resource_group_name = azurerm_resource_group.squaremarket-group.name
  dns_prefix          = "squaremarket-aks"

  default_node_pool {
    name                = "system"
    node_count          = 2
    vm_size             = "Standard_DS2_v2"

    upgrade_settings {
      max_surge = "10%"
    }
  }

  identity {
    type = "SystemAssigned"
  }

  network_profile {
    load_balancer_sku = "standard"
    network_plugin    = "kubenet"
    network_policy = "calico"
  }

  tags = {
    "environment" = "production"
    "source"      = "terraform"
  }
}

resource "azurerm_role_assignment" "aks_pull_acr" {
  scope                = azurerm_container_registry.acr.id
  role_definition_name = "AcrPull"
  principal_id         = azurerm_kubernetes_cluster.api.kubelet_identity[0].object_id
}

resource "azurerm_dns_zone" "frontend" {
  name                = "sq.rikdenbreejen.nl"
  resource_group_name = azurerm_resource_group.squaremarket-group.name
}

resource "azurerm_dns_zone" "api" {
  name                = "sq.api.rikdenbreejen.nl"
  resource_group_name = azurerm_resource_group.squaremarket-group.name
}

resource "azurerm_frontdoor" "frontdoor" {
  name = "squaremarket-frontdoor"
  resource_group_name = azurerm_resource_group.squaremarket-group.name

  frontend_endpoint {
    name = "frontend"
    host_name = azurerm_dns_zone.frontend.name
  }

  frontend_endpoint {
    name = "api"
    host_name = azurerm_dns_zone.api.name
  }

  frontend_endpoint {
    name = "frontdoor"
    host_name = "squaremarket-frontdoor.azurefd.net"
  }

  backend_pool {
    name = "frontend"

    backend {
      host_header = azurerm_storage_account.frontend-account.primary_web_host
      address = azurerm_storage_account.frontend-account.primary_web_host
      http_port = 80
      https_port = 443
    }

    load_balancing_name = "frontend"
    health_probe_name = "frontend"
  }

  # backend_pool {
  #   name = "api"
  #
  #   backend {
  #     host_header = azurerm_kubernetes_cluster.api.fqdn
  #     address = azurerm_kubernetes_cluster.api.fqdn
  #     http_port = 80
  #     https_port = 443
  #   }
  #
  #   load_balancing_name = "api"
  #   health_probe_name = "api"
  # }

  routing_rule {
    name = "https-frontend"
    accepted_protocols = ["Https"]
    patterns_to_match = ["/*"]
    frontend_endpoints = ["frontend"]
    forwarding_configuration {
      forwarding_protocol = "HttpsOnly"
      backend_pool_name = "frontend"
    }
  }

  # routing_rule {
  #   name = "https-api"
  #   accepted_protocols = ["Https"]
  #   patterns_to_match = ["/*"]
  #   frontend_endpoints = ["api"]
  #   forwarding_configuration {
  #     forwarding_protocol = "HttpsOnly"
  #     backend_pool_name = "api"
  #   }
  # }

  routing_rule {
    name = "https-redirect"
    accepted_protocols = ["Http"]
    patterns_to_match = ["/*"]
    frontend_endpoints = ["frontend"]
#, "api"]
    redirect_configuration {
      redirect_protocol = "HttpsOnly"
      redirect_type = "Moved"
    }
  }

  backend_pool_settings {
    enforce_backend_pools_certificate_name_check = false
  }

  backend_pool_load_balancing {
    name = "frontend"
  }

  backend_pool_health_probe {
    name = "frontend"
    protocol = "Https"
  }

  # backend_pool_load_balancing {
  #   name = "api"
  # }
  #
  # backend_pool_health_probe {
  #   name = "api"
  #   protocol = "Https"
  # }
}

resource "azurerm_frontdoor_custom_https_configuration" "frontend-https" {
  frontend_endpoint_id              = azurerm_frontdoor.frontdoor.frontend_endpoints.frontend
  custom_https_provisioning_enabled = true
  custom_https_configuration {
    certificate_source = "FrontDoor"
  }
}

resource "azurerm_frontdoor_custom_https_configuration" "api-https" {
  frontend_endpoint_id              = azurerm_frontdoor.frontdoor.frontend_endpoints.api
  custom_https_provisioning_enabled = true
  custom_https_configuration {
    certificate_source = "FrontDoor"
  }
}

resource "azurerm_storage_account" "frontend-account" {
  name                = "squaremarketfrontend"
  resource_group_name = azurerm_resource_group.squaremarket-group.name
  location            = azurerm_resource_group.squaremarket-group.location

  account_tier             = "Standard"
  account_replication_type = "GRS"

  static_website {
    index_document = "index.html"
    error_404_document = "index.html"
  }

  custom_domain {
    name = "sq.rikdenbreejen.nl"
    use_subdomain = false
  }

  tags = {
    "environment" = "production"
    "source"      = "terraform"
  }
}

resource "azurerm_storage_account" "storage-account" {
  name                = "squaremarketblobstorage"
  resource_group_name = azurerm_resource_group.squaremarket-group.name
  location            = azurerm_resource_group.squaremarket-group.location

  account_tier             = "Standard"
  account_replication_type = "GRS"

  tags = {
    "environment" = "production"
    "source"      = "terraform"
  }
}

resource "azurerm_storage_container" "storage-container" {
  name                  = "advertisement-images"
  storage_account_name  = azurerm_storage_account.storage-account.name
  container_access_type = "private"
}

resource "azurerm_mysql_server" "accounts-db-server" {
  name                = "squaremarket-accounts"
  resource_group_name = azurerm_resource_group.squaremarket-group.name
  location            = azurerm_resource_group.squaremarket-group.location
  version             = "8.0"

  sku_name = "B_Gen5_1"
  storage_mb = 5120

  administrator_login          = var.db_admin_user
  administrator_login_password = var.db_admin_password

  public_network_access_enabled     = true
  ssl_enforcement_enabled           = true
  ssl_minimal_tls_version_enforced  = "TLS1_2"

  tags = {
    "environment" = "production"
    "source"      = "terraform"
  }
}

resource "azurerm_mysql_firewall_rule" "accounts-db-to-server" {
  name                = "server"
  resource_group_name = azurerm_resource_group.squaremarket-group.name
  server_name         = azurerm_mysql_server.accounts-db-server.name
  start_ip_address    = "0.0.0.0"
  end_ip_address      = "255.255.255.255"
}

resource "azurerm_mysql_database" "accounts-db" {
  name                = "accounts"
  resource_group_name = azurerm_resource_group.squaremarket-group.name
  server_name         = azurerm_mysql_server.accounts-db-server.name
  charset             = "utf8"
  collation           = "utf8_unicode_ci"
}

resource "azurerm_mysql_server" "advertisements-db-server" {
  name                = "squaremarket-advertisements"
  resource_group_name = azurerm_resource_group.squaremarket-group.name
  location            = azurerm_resource_group.squaremarket-group.location
  version             = "8.0"

  sku_name = "B_Gen5_1"
  storage_mb = 5120

  administrator_login          = var.db_admin_user
  administrator_login_password = var.db_admin_password

  public_network_access_enabled     = true
  ssl_enforcement_enabled           = true
  ssl_minimal_tls_version_enforced  = "TLS1_2"

  tags = {
    "environment" = "production"
    "source"      = "terraform"
  }
}

resource "azurerm_mysql_firewall_rule" "advertisements-db-to-server" {
  name                = "server"
  resource_group_name = azurerm_resource_group.squaremarket-group.name
  server_name         = azurerm_mysql_server.advertisements-db-server.name
  start_ip_address    = "0.0.0.0"
  end_ip_address      = "255.255.255.255"
}

resource "azurerm_mysql_database" "advertisements-db" {
  name                = "advertisements"
  resource_group_name = azurerm_resource_group.squaremarket-group.name
  server_name         = azurerm_mysql_server.advertisements-db-server.name
  charset             = "utf8"
  collation           = "utf8_unicode_ci"
}


resource "azurerm_mysql_server" "messages-db-server" {
  name                = "squaremarket-messages"
  resource_group_name = azurerm_resource_group.squaremarket-group.name
  location            = azurerm_resource_group.squaremarket-group.location
  version             = "8.0"

  sku_name = "B_Gen5_1"
  storage_mb = 5120

  administrator_login          = var.db_admin_user
  administrator_login_password = var.db_admin_password

  public_network_access_enabled     = true
  ssl_enforcement_enabled           = true
  ssl_minimal_tls_version_enforced  = "TLS1_2"

  tags = {
    "environment" = "production"
    "source"      = "terraform"
  }
}

resource "azurerm_mysql_firewall_rule" "messages-db-to-server" {
  name                = "server"
  resource_group_name = azurerm_resource_group.squaremarket-group.name
  server_name         = azurerm_mysql_server.messages-db-server.name
  start_ip_address    = "0.0.0.0"
  end_ip_address      = "255.255.255.255"
}

resource "azurerm_mysql_database" "messages-db" {
  name                = "messages"
  resource_group_name = azurerm_resource_group.squaremarket-group.name
  server_name         = azurerm_mysql_server.messages-db-server.name
  charset             = "utf8"
  collation           = "utf8_unicode_ci"
}
