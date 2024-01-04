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

resource "azurerm_kubernetes_cluster" "aks" {
  name                = "squaremarket-aks"
  kubernetes_version  = "1.28.0"
  location            = azurerm_resource_group.squaremarket-group.location
  resource_group_name = azurerm_resource_group.squaremarket-group.name
  dns_prefix          = "squaremarket-aks"

  default_node_pool {
    name                = "system"
    node_count          = 1
    vm_size             = "Standard_DS2_v2"
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

