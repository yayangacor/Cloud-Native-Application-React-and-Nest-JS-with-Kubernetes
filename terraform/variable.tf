variable "n" {
  type = string
}

variable "location" {
  type    = string
  default = "indonesiacentral"
}

variable "db_admin_login" {
  type = string
}

variable "db_admin_password" {
  type      = string
  sensitive = true
}
