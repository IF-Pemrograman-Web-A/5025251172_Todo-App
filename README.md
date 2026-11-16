# 5025251172_Todo-App

Nama: Zainab Ammar Zahra <br>
NRP: 5025251172

## Description
[E06] The Endpoint of Portals - RESTful API

## Preview

### RESTful API

Todo App menggunakan RESTful API untuk mengelola data task melalui HTTP method `GET`, `POST`, `PUT`, `PATCH`, dan `DELETE`. API diimplementasikan pada `api.php` menggunakan PHP dan terhubung dengan database PostgreSQL melalui `config.php`.

### API Endpoints

| Method | Endpoint | Fungsi | Success Code |
|---|---|---|---|
| GET | `api.php?scope=personal` | Mengambil seluruh task | 200 OK |
| GET | `api.php?id=1&scope=personal` | Mengambil task berdasarkan ID | 200 OK |
| POST | `api.php?scope=personal` | Menambahkan task baru | 201 Created |
| PUT | `api.php?id=1&scope=personal` | Memperbarui data task | 200 OK |
| PATCH | `api.php?id=1&scope=personal` | Mengubah status Completed/Pending | 200 OK |
| DELETE | `api.php?id=1&scope=personal` | Menghapus task | 204 No Content |

Parameter `scope` digunakan untuk menentukan kategori task, yaitu `personal` atau `shared`.

### GET Request

Method `GET` digunakan untuk mengambil data task dari database PostgreSQL. Jika berhasil, API mengembalikan response code `200 OK` beserta data task dalam format JSON.

<img width="959" height="503" alt="image" src="https://github.com/user-attachments/assets/682e4349-1ac7-43fa-8e76-ab8f96e3d743" />


### POST Request

Method `POST` digunakan untuk menambahkan task baru. Data dikirim menggunakan `FormData` dari frontend ke `api.php`. Jika berhasil, API mengembalikan response code `201 Created`.

<img width="959" height="503" alt="image" src="https://github.com/user-attachments/assets/01954794-3da8-4281-b320-d7466c012df3" />


### PUT Request

Method `PUT` digunakan untuk memperbarui data task seperti `title`, `description`, `due_date`, dan `notification_time`. Jika berhasil, API mengembalikan response code `200 OK`.

<img width="959" height="503" alt="image" src="https://github.com/user-attachments/assets/6521f88a-0f32-47be-bd9b-4bef47dd0fb5" />


### PATCH Request

Method `PATCH` digunakan untuk mengubah status task menjadi Completed atau Pending tanpa mengubah data task lainnya. Ketika checkbox ditekan, frontend mengirim request PATCH dan memperbarui tampilan secara langsung.

<img width="959" height="503" alt="image" src="https://github.com/user-attachments/assets/9702679e-a591-4990-a285-777f5ed802ba" />


### DELETE Request

Method `DELETE` digunakan untuk menghapus task berdasarkan ID. Jika berhasil, API mengembalikan response code `204 No Content` tanpa response body.

<img width="959" height="502" alt="image" src="https://github.com/user-attachments/assets/72deaf3e-a018-44b0-bcf8-d731e4dddfd8" />


### HTTP Response Codes

Setiap endpoint mengembalikan HTTP response code sesuai dengan hasil request.

| Response Code | Keterangan |
|---|---|
| 200 OK | Request berhasil |
| 201 Created | Task berhasil ditambahkan |
| 204 No Content | Task berhasil dihapus |
| 400 Bad Request | Parameter atau format request tidak valid |
| 404 Not Found | Task tidak ditemukan |
| 405 Method Not Allowed | HTTP method tidak didukung |
| 422 Unprocessable Content | Data tidak memenuhi validasi |
| 500 Internal Server Error | Terjadi kesalahan pada server |

### Error Handling

API menangani request yang tidak valid dengan memberikan HTTP response code dan pesan error dalam format JSON.

**400 Bad Request**

Terjadi ketika parameter request tidak valid, misalnya ID task bukan angka.

<img width="959" height="503" alt="image" src="https://github.com/user-attachments/assets/1d3506f6-6907-40cc-9d73-3c2911676c65" />


**404 Not Found**

Terjadi ketika pengguna mencoba mengakses task dengan ID yang tidak ditemukan dalam database.

<img width="959" height="502" alt="image" src="https://github.com/user-attachments/assets/e59d7066-b8dc-4d95-a9d2-0340190e5018" />


**405 Method Not Allowed**

Terjadi ketika request menggunakan HTTP method yang tidak didukung oleh endpoint.

<img width="959" height="503" alt="image" src="https://github.com/user-attachments/assets/db991402-a5ea-432d-8242-19672819064e" />


**422 Unprocessable Content**

Terjadi ketika data task tidak memenuhi validasi, misalnya title task kosong.

<img width="959" height="503" alt="image" src="https://github.com/user-attachments/assets/e2d586f8-9a39-4a19-ace6-3998519c3ffa" />


### Task Management

Todo App menyediakan fitur pengelolaan task, mulai dari menambahkan, melihat, mengedit, hingga menghapus task. Task dapat dikelompokkan ke dalam kategori Personal dan Shared, serta ditandai sebagai Completed atau Pending.

**Personal Tasks**

<img width="960" height="540" alt="image" src="https://github.com/user-attachments/assets/5a716894-79f2-4767-a01b-f43ecc808bd8" />

<img width="960" height="540" alt="image" src="https://github.com/user-attachments/assets/30cbbb00-93e9-4a22-81ef-6e8810a2a7d0" />

**Shared Tasks**

<img width="960" height="540" alt="image" src="https://github.com/user-attachments/assets/0519b33e-1046-4734-bf19-9fd91ff664d7" />

<img width="960" height="540" alt="image" src="https://github.com/user-attachments/assets/f798cded-6002-4260-827a-8bedc7c1afdc" />

**Completed Tasks**

<img width="960" height="540" alt="image" src="https://github.com/user-attachments/assets/bc08ead4-940a-4822-a956-b1f0396f2b5c" />

<img width="960" height="540" alt="image" src="https://github.com/user-attachments/assets/2874fa9f-5d67-411c-b5cb-60a10605b82f" />
