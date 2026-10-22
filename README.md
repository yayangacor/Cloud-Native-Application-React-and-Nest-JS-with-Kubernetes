# WSpeedrun.com di Azure Kubernetes Service

Jawaban Variant 1: aplikasi WSpeedrun (frontend React + backend NestJS) di-deploy ke AKS dengan Terraform, Docker, Azure Container Registry, dan Kubernetes manifest. Database memakai Azure Database for MySQL yang hanya bisa diakses lewat Private Endpoint.

## Struktur

| Folder / file | Isi |
|---|---|
| `terraform/` | Resource Group, VNet + 2 subnet, MySQL + Private Endpoint, ACR, AKS |
| `backend/`, `frontend/` | Source code + Dockerfile |
| `docker-compose.yaml` | Tes lokal: MySQL + backend + frontend |
| `k8s/k8s.yaml` | Secret, Job migrasi, Service, Deployment, Ingress |

## Catatan perbaikan

Commit `Initial commit` berisi jawaban asli. Commit berikutnya memperbaiki hal-hal di bawah ini.

### Terraform

- Region `centraljakarta` tidak ada di Azure. Diganti ke `indonesiacentral` (ada di daftar region yang diizinkan langganan Azure for Students), sekarang lewat variabel `location`.
- Dua subnet sebelumnya bernama sama (`-aks-sn`), jadi apply pasti gagal. Sekarang ada `-aks-sn` untuk AKS dan `-pe-sn` untuk Private Endpoint database.
- Private Endpoint sebelumnya ada di subnet AKS dengan subresource `blob` (itu untuk Storage). Sekarang di `-pe-sn` dengan subresource `mysqlServer`.
- Nama server MySQL sebelumnya `-flexible-server`, tidak sesuai format soal. Sekarang `2902697845-db`. Database di dalamnya bernama `wspeedrun` dengan charset `utf8mb4`.
- Username dan password admin MySQL pindah dari `main.tf` ke variabel (password ditandai `sensitive`), nilainya di `terraform.tfvars`.
- ACR sebelumnya pakai `anonymous_pull_enabled`, jadi image bisa di-pull siapa saja. Sekarang AKS pull lewat role `AcrPull`.
- AKS mendapat role `Network Contributor` di subnetnya.
- Add-on app routing (`web_app_routing`) yang dipakai Ingress sekarang didefinisikan di Terraform, tidak lagi hanya lewat `az aks approuting enable`.
- Network AKS diganti dari `kubenet` ke Azure CNI Overlay. `dns_prefix` harus diawali huruf, jadi sekarang `aks-2902697845`.
- Ditambah `outputs.tf`: login server ACR, nama AKS, FQDN MySQL, dan IP private MySQL.

### Docker

- `frontend/Dockerfile`:
  - Baris 1 tidak diawali `#`, jadi build langsung gagal. Sudah diperbaiki.
  - `COPY --from=build` sekarang memakai nama stage yang benar, `build-stage`.
  - `VITE_API_URL` sebelumnya tidak di-set, sehingga frontend memanggil `http://localhost:3000` dari browser user. Sekarang default `/api`, jadi request lewat host yang sama dan diteruskan oleh Ingress (AKS) atau nginx (lokal).
  - Base image diganti dari `node:23` (sudah end-of-life) ke `node:24-alpine`.
- `frontend/nginx.conf`: kurung `}` penutup blok `server` hilang sehingga nginx gagal start. `proxy_pass` sebelumnya ke port 5000 dan tidak membuang prefix `/api`. Sekarang `http://backend:3000/`.
- Ditambah `.dockerignore` (`node_modules`, `dist`, `.env`) di backend dan frontend.
- `dockercompose.yaml` (kosong, dan namanya tidak dikenali Docker Compose) diganti menjadi `docker-compose.yaml`. Isinya MySQL lokal, backend (migrate dan seed dulu, baru start), dan frontend di port 8080. Database Azure bersifat private, jadi tes lokal butuh MySQL sendiri.

### Kubernetes (`k8s/k8s.yaml`)

- `name` di bawah `envFrom.secretRef` salah indentasi, sehingga Secret tidak masuk ke pod backend. Sudah diperbaiki.
- Image sebelumnya dari `2902697845.azurecr.io`. Login server ACR yang benar adalah `2902697845acr.azurecr.io`.
- Host database di Secret sebelumnya `2902697845-fs.database.azure.com` (salah nama dan tidak ada `.mysql`). Sekarang `2902697845-db.mysql.database.azure.com`.
- Nilai `sslaccept=accept-invalid-certificates` tidak valid untuk Prisma. Diganti ke `accept_invalid_certs`. Parameter ini tetap dipakai karena Azure MySQL mewajibkan TLS.
- Regex path Ingress `/api(./|*)(.*)` tidak valid. Diganti ke `/api(/|$)(.*)`. Dua rule digabung menjadi satu rule dengan dua path.
- Service sekarang menuliskan `type: ClusterIP` secara eksplisit.
- Ditambah Job `db-migrate` yang menjalankan `prisma migrate deploy` dan seed dari dalam VNet. Database private, jadi migrasi tidak bisa dijalankan dari laptop.
- Service ditaruh sebelum Deployment supaya nginx di pod frontend bisa me-resolve `backend` saat start.

### Temuan saat cek ke Azure

- `Standard_D2_v3` tidak tersedia di `indonesiacentral`. Kuota langganan hanya ada untuk keluarga DSv4, DDSv4, dan EDSv4 (masing-masing 4 vCPU), jadi node AKS memakai `Standard_D2s_v4`. Ukuran v5 akan gagal karena kuotanya 0.
- MySQL 8.0.21 dengan `B_Standard_B1ms` tersedia di `indonesiacentral`.
- Di azurerm 5.0, blok `node_provisioning_profile` wajib ada di AKS, jadi tetap dipakai dengan `mode = "Manual"`.
- Provider memakai subscription yang sedang aktif di Azure CLI (`az login`), jadi `subscription_id` tidak perlu ditulis di `provider.tf`.

## Urutan menjalankan

Prasyarat: Azure CLI (sudah `az login`), Terraform, Docker Desktop (sedang berjalan), dan kubectl.

### 1. Provision infrastruktur

```
cd terraform
terraform init
terraform apply
terraform output
cd ..
```

### 2. Build dan push image ke ACR

```
az acr login -n 2902697845acr
docker build -t 2902697845acr.azurecr.io/backend:v1 ./backend
docker push 2902697845acr.azurecr.io/backend:v1
docker build -t 2902697845acr.azurecr.io/frontend:v1 ./frontend
docker push 2902697845acr.azurecr.io/frontend:v1
```

Tidak perlu `--build-arg VITE_API_URL=...` karena default di Dockerfile sudah `/api`. Kalau tetap diberikan dari Git Bash, Git Bash akan mengubah `/api` menjadi `C:/Program Files/Git/api`.

### 3. Deploy ke AKS

```
az aks get-credentials -g 2902697845-rg -n 2902697845-aks
kubectl apply -f k8s/k8s.yaml
kubectl get job,pods,svc,ingress
```

Buka IP dari `kubectl get ingress` di browser untuk frontend. Untuk tes API, buka `http://<IP>/api/games`.

Job tidak bisa diubah setelah dibuat. Untuk menjalankan migrasi ulang (misalnya setelah image backend di-push ulang), jalankan `kubectl delete job db-migrate` lalu `kubectl apply -f k8s/k8s.yaml` lagi.

### Tes lokal

```
docker compose up --build
```

Frontend di `http://localhost:8080`, backend di `http://localhost:3000` (contoh: `http://localhost:3000/games`).

## Status pengecekan

- Terraform: `terraform fmt` dan `terraform validate` lolos dengan azurerm 5.0.0. Belum di-`apply`.
- `k8s.yaml`: struktur YAML valid, regex Ingress valid. Routing disimulasikan: `/api/games` diteruskan ke backend sebagai `/games`, sedangkan `/` dan `/games/abc` ke frontend.
- Frontend: `npm run build` berhasil dan `/api` tertanam di hasil build.
- Image Docker belum di-build, dan aplikasi belum di-deploy ke AKS.
