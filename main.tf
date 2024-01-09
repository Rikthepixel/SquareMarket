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

resource "azurerm_dns_zone" "frontend" {
  name                = "sq.rikdenbreejen.nl"
  resource_group_name = azurerm_resource_group.squaremarket-group.name
}

resource "azurerm_dns_zone" "backend" {
  name                = "sq.api.rikdenbreejen.nl"
  resource_group_name = azurerm_resource_group.squaremarket-group.name
}

resource "azurerm_kubernetes_cluster" "aks" {
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
  principal_id         = azurerm_kubernetes_cluster.aks.kubelet_identity[0].object_id
}

resource "azurerm_storage_account" "frontend-account" {
  name                = "squaremarketfrontend"
  resource_group_name = azurerm_resource_group.squaremarket-group.name
  location            = azurerm_resource_group.squaremarket-group.location

  account_tier             = "Standard"
  account_replication_type = "GRS"

  static_website {
    index_document = "index.html"
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

resource "azurerm_storage_container" "frontendstorage-container" {
  name                  = "frontend-storage-container"
  storage_account_name  = azurerm_storage_account.frontend-account.name
  container_access_type = "private"
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
  name                  = "storage-container"
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
