Saya menggunakan WSL ubuntu dalam pengerjaannya.
### Langkah-Langkah Pengerjaan
1. Clone directory CHAT-APP dari https://github.com/ncclaboratory18/Oprec_2025_Pertemuan_3. Jika tidak ingin menclonenya kalian dapat membuat folder dengan struktur sebagai berikut:
   
   ![image](https://github.com/user-attachments/assets/6874b559-3a60-4ef5-98ef-62851fa86dd5)
   
   untuk isi dari setiap filenya bisa copy sesuai namanya dari github tersebut.
2. Setelah itu jalankan `deno run main.ts` di directory `chat-app`. Jika kalian belum memiliki deno kalian dapat menggunakan langkah-langkah beriktu(hanya untuk ubuntu):
   - Install deno dengan command berikut `url -fsSL https://deno.land/install.sh | sh`.
   - Setelah deno berhasil terinstal nanti akan keluar tampilan tawaran untuk menambahkan deno ke path. lalu lakukan `CTRL+C` untuk keluar dari tampilan karena kita akan menambahkan ke path secara manual.
   - Tambahkan deno ke path dengan command berikut:
     ```
     export DENO_INSTALL="/home/$USER/.deno"
     export PATH="$DENO_INSTALL/bin:$PATH"
     ```
   - Lalu cek apakah deno sudah berhasil terinstal dengan benar menggunakan command berikut `deno --version`
3. setelah menjalankan `deno run main.ts` akan muncul tampilan sebagai berikut
   ![image](https://github.com/user-attachments/assets/ad134539-6cb3-40e2-b0c7-1cacd6851a7c)
   lalu pilih yang A = allow all net permissions. setelah itu nanti akan mendapatkan link seperti ini `http://localhost:8080/`
4. jika berhasil tampilan di browsernya akan seperti ini
   ![image](https://github.com/user-attachments/assets/19327daf-1941-4938-9737-0ef4fb10be41)
   lalu kita masukkan nama usernya. setelah itu akan menjadi seperti ini:
   ![image](https://github.com/user-attachments/assets/2374f2f9-2c53-41c9-a2a7-55a538373751)
   jika ingin menambahkan user baru kalian bisa mengcopy `http://localhost:8080/` di tab baru dan memassukan nama usernya.
   berikut adalah tampilah chat ketika di public ketika ada 2 user atau lebih:
   ![image](https://github.com/user-attachments/assets/f7e62637-9179-4515-b341-666d914c56fd)
   ![image](https://github.com/user-attachments/assets/409f4593-be97-4ddd-96df-e492565063bc)

