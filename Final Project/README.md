Saya menggunakan WSL ubuntu dalam pengerjaannya.
### Langkah-Langkah Pengerjaan
1. Clone directory CHAT-APP dari https://github.com/ncclaboratory18/Oprec_2025_Pertemuan_3
2. Install npm dengan command berikut:
```
sudo apt update
sudo apt install nodejs npm
```
3. Setelah itu cek apakah nodejs dan npm sudah terinstall dengan command berikut:
```
nodejs -v
npm -v
```
4. Setelah itu install deno dengan command berikut `url -fsSL https://deno.land/install.sh | sh`
5. Setelah deno berhasil terinstal nanti akan keluar tampilan tawaran untuk menambahkan deno ke path. lalu lakukan `CTRL+C` untuk keluar dari tampilan karena kita akan menambahkan ke path secara manual.
6. Tambahkan deno ke path dengan command berikut:
```
export DENO_INSTALL="/home/$USER/.deno"
export PATH="$DENO_INSTALL/bin:$PATH"
```
7. Lalu cek apakah deno sudah berhasil terinstal dengan benar menggunakan command berikut `deno --version`
8. Setelah itu jalankan command `npm init -y` di dalam directory CHATT-APP dan akan terbentuk file baru bernama `package.json`
9. setelah itu modif isi file package.json sebagai berikut:
```
{
  "name": "chat-app",
  "version": "1.0.0",
  "description": "A simple chat application",
  "main": "main.ts", 
  "scripts": {
    "start": "deno run --allow-net main.ts" 
  },
  "dependencies": {
  },
  "author": "",
  "license": "ISC"
}
```
10. setelah itu jalankan `npm start` dan buka link yang muncul seperti `http://localhost:8080`. lalu kembali ke terminal dan nanti akan muncul
![Image](https://github.com/user-attachments/assets/98bb102b-edcd-4266-b773-b6795ffd7c41)
lalu atur permission agar allow all read permissions (A) dan tampilannya akan menjadi seperti ini:
![Image](https://github.com/user-attachments/assets/6d82fc17-84a7-401b-b477-f0987e71664b)
11. jika berhasil tampilan di browsernya akan seperti ini
![image](https://github.com/user-attachments/assets/19327daf-1941-4938-9737-0ef4fb10be41)
lalu kita masukkan nama usernya. setelah itu akan menjadi seperti ini:
![image](https://github.com/user-attachments/assets/2374f2f9-2c53-41c9-a2a7-55a538373751)
jika ingin menambahkan user baru kalian bisa mengcopy `http://localhost:8080/` di tab baru dan memassukan nama usernya.
berikut adalah tampilah chat ketika di public ketika ada 2 user atau lebih:
![image](https://github.com/user-attachments/assets/f7e62637-9179-4515-b341-666d914c56fd)
![image](https://github.com/user-attachments/assets/409f4593-be97-4ddd-96df-e492565063bc)

