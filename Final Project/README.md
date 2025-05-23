link menuju web:
www.indhiraayupuspitaningrum-portofolio.site

https://indhiraayupuspitaningrum-portofolio.site/

http://34.128.80.192/

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

### langkah-langkah deploy
1. Buat akun Google Cloud
2. setelah akun berhasil dibuat masuk ke `console`, lalu cari `compute engine` di search bar
3. aktifkan `compute engine` terlebih dahulu
4. lalu `create instance`
5. isi detail instance dengan:
   - nama: `kelompok4`
   - region dan zone: `asia-southeast2 (Jakarta)`.
   - machine type: `e2-micro`.
   - allow HTTP traffic
   - allow HTTPS traffic
   - klik `Create`
6. setelah vm berhasil dibuat atur stati ip nya:
   - cari `IP Addreses` lalu cari ip external yang kita miliki pada list yang ada.
   - setelah menemukannya tekan `promote to static`
7. setelah itu vm kita akan aktif
8. lalu tekan tombol `SSH` dan akan muncul pop-up yang mengizinkan SSH pada browser. lalu tekan `Authorize`
9. lakukan `sudo su` lalu ketik `nano /etc/ssh/sshd_config`
10. setelah itu lakukan perubahan supaya kedua baris PermitRootLogin dan PasswordAuthentication menjadi seperti berikut:
```
  PermitRootLogin yes
  PasswordAuthentication yes
```
10. ketik `systemctl restart sshd`
11. ketik `passwd lalu masukkan password baru untuk root kita
12. setelah itu lakukan koneksi ke terminal atau powershell dengan command `ssh root@ipeksternal`
13. setelah itu download dependensi docker dan docker compose. sebelum menginstal docker pastikan terlebih dahulu distro vm yang kita gunakan dengan command `cat /etc/os-release`. dan akan menampilkan berikut:
    
    ```
    root@kelompok-4:~# cat /etc/os-release
    PRETTY_NAME="Debian GNU/Linux 12 (bookworm)"
    NAME="Debian GNU/Linux"
    VERSION_ID="12"
    VERSION="12 (bookworm)"
    VERSION_CODENAME=bookworm
    ID=debian
    HOME_URL="https://www.debian.org/"
    SUPPORT_URL="https://www.debian.org/support"
    BUG_REPORT_URL="https://bugs.debian.org/"
    ```
    karena distro kita menggunakan debian maka jalankan command-command berikut untuk menginstall docker dan docker-compose:

    - kita hapus dulu package yang sudah ada
    ```
    for pkg in docker.io docker-doc docker-compose podman-docker containerd runc; do sudo apt-get remove $pkg; done
    ```
    - lalu setup docker's apt repository:
    ```
       # Add Docker's official GPG key:
      sudo apt-get update
      sudo apt-get install ca-certificates curl
      sudo install -m 0755 -d /etc/apt/keyrings
      sudo curl -fsSL https://download.docker.com/linux/debian/gpg -o /etc/apt/keyrings/docker.asc
      sudo chmod a+r /etc/apt/keyrings/docker.asc
   
      # Add the repository to Apt sources:
      echo \
      "deb [arch=$(dpkg --print-architecture) signed-by=/etc/apt/keyrings/docker.asc]       https://download.docker.com/linux/debian \
      $(. /etc/os-release && echo "$VERSION_CODENAME") stable" | \
      sudo tee /etc/apt/sources.list.d/docker.list > /dev/null
      sudo apt-get update
    ```
    - selanjutnya install docker versi terbarunys
    ```
    sudo apt-get install docker-ce docker-ce-cli containerd.io docker-buildx-plugin docker-compose-plugin
    ```
    - lalu cek apakah docker berhasil terinstall apa tidak dengan command `docker --version` dan `docker compose version`
    - jika sudah ada maka akan menghasilkan `Docker version 28.1.1, build 4eba377` dan `Docker Compose version v2.35.1`
14. jika sudah menginstal semua toolsnya kita clone repositorynya
15. lalu masuk ke dalam chatt-app dan jalankan `docker compose up -d` karena file `docker-compose.yml` nya ada di dalam directory tersebut. jika sudah tampilannya akan seperti ini:
![image](https://github.com/user-attachments/assets/f6a09b4c-fc9f-4783-bfed-f34bf7570cd1)
16. lalu buka ip `http://ip-eksternal/`
17. jika bad gateaway tunggu beberapa saat. jika masih seperti itu cek dengan command `docker compose logs deno-app`. jika tampilannya seperti ini:
![image](https://github.com/user-attachments/assets/55a21971-5516-4197-9157-95d17897c3bf)

berarti versi image docker yang kita pakai tidak sesuai. kalian bisa menggunakan `FROM denoland/deno:alpine` agar selalu menggunakan image versi terbaru. setelah menggantinya jalankan
```
docker-compose down
docker-compose up -d --build
```
dan pastikan ketika menjalankan `docker compose logs deno-app` tampilannya seperti ini:
![image](https://github.com/user-attachments/assets/3b87986b-c1d4-4746-a0ae-53c7a83f4cbd)
setelah itu coba buka `http://ip-eksternal/`
jika berhasil tampilannya akan seperti ini
![image](https://github.com/user-attachments/assets/1f08ea5b-76c6-46e7-a93b-87c58e2fd313)

### Cara agar web secure
karena web yang telah kita buat masih menggunakan http sehingga masih belum secure. jadi kita perlu mengalihkannya ke https. kita akan menggunakan `Cloudeflare`. sebelumnya saya sudah membeli domain di `hostinger` untuk project ctfd sebelumnya. sehingga saya tidak perlu memberikan perlakuan kepada hostinger dan tidak perlu menambah domain. saya hanya perlu menghapus dns dan tunel yang sudah pernah saya buat sebelumnya. lalu saya membuat tunel baru menggunakan domain yang sama hanya mengganti pada ip-nya seperti ini.
![image](https://github.com/user-attachments/assets/01a913be-2eef-4be1-b0ec-089ac3514539)

setelah itu kita save dan akan terbentuk dns bertipe CNAME. sebenarnya saat ini kita sudah bisa menggunakan https://indhiraayupuspitaningrum-portofolio.site/ dan sudah secure. tetapi jika ingin menggunakan `www` maka kita dapat menambahkan dns record dengan tipe berikut
| type   | name | content      |
|--------|------|----------|
| @ | indhiraayupuspitaningrum-portofolio.site | 34.128.80.192 |
| A | www   | 34.128.80.192 |

setelah itu bisa menggunakan www.indhiraayupuspitaningrum-portofolio.site

### Fitur:
- global room
  setiap user memiliki warna yang berbeda pada nama mereka di bubble chat
  ![image](https://github.com/user-attachments/assets/8e10e9d8-56a0-404f-92b8-f6c02a81d168)
  
- private room
  - every user can make private room (dengan password dan tanpa password)
    ada 2 jenis private room yang dapat dibuat oleh user yaitu yang mrnggunakan password dan yang tidak menggunakan password
    ![image](https://github.com/user-attachments/assets/54177d74-4bdf-442a-b3e8-26e086b6f9d4)

  - every user can find, join, and leave private room
    user bisa melihat semua private room yang ada dan dapat join ke semuanya. jika user ingin join ke private zoom yang terkunci maka dia harus memasukkan password dulu sebelum masuk. jika tanpa kunci user bisa langsung masuk saja.
    ![image](https://github.com/user-attachments/assets/e8dd837c-2111-493d-beab-bacfee8adb9b)

    ![image](https://github.com/user-attachments/assets/0fcaefd2-513a-4fb5-bbaf-61cf9874b0f2)

    ![image](https://github.com/user-attachments/assets/24735211-4fb8-4178-9ef0-5fd4104b0adc)

    ![image](https://github.com/user-attachments/assets/5d95b296-3bb9-4047-bdd8-3ac89fa43522)
    
  - every user can known who is in the private room
   
    ![Screenshot 2025-05-21 232245](https://github.com/user-attachments/assets/0c93b658-df17-4e26-95f1-f33a78199fad)

- polling
  - multiple option

    ![image](https://github.com/user-attachments/assets/23d99b2a-5be6-4dbd-a682-fa5556da81a5)

  - single option

    ![image](https://github.com/user-attachments/assets/aa074c79-a447-42e9-b5e6-b5714b4a2b30)

  - timer
    setiap user bisa memberikan timer pada polling sehingga polling tertutup otomatis

    ![image](https://github.com/user-attachments/assets/c56a78d9-0b03-4287-8913-176ba63626c1)

  - close polling

    ![image](https://github.com/user-attachments/assets/bc41c284-85f5-4a91-ab68-54a333f802ca)
