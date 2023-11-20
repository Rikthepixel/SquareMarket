terraform {
  required_providers {
    azurerm = {
      source = "hashicorp/azurerm"
      version = "3.0.0"
    }
  }
}

provider "azurerm" {
  features {}
}

resource "azurer_resource_group" "squaremarket-group" {
  name = "squaremarket-group"
  location = "North Europe"
}
