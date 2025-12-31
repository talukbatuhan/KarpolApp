# Admin Hesabı Nasıl Oluşturulur?

Sistemimizde "Admin" rolü, veritabanındaki `profiles` tablosunda `role` sütununun `'admin'` olmasıyla belirlenir. 

Şu adımları izleyerek bir kullanıcıyı Admin yapabilirsiniz:

1.  **Kullanıcı Oluşturun:**
    *   Uygulama üzerinden (`/login` sayfasından) normal bir üyelik oluşturun veya giriş yapın.
    *   (Not: Kayıt olma ekranı henüz yoksa, Supabase Dashboard -> Authentication -> Users kısmından "Add User" diyerek manuel kullanıcı ekleyebilirsiniz).

2.  **Kullanıcı ID'sini Alın:**
    *   Supabase Dashboard -> **Authentication** menüsüne gidin.
    *   İlgili kullanıcının `User UID` değerini kopyalayın.

3.  **SQL Komutunu Çalıştırın:**
    *   Supabase Dashboard -> **SQL Editor** menüsüne gidin.
    *   Aşağıdaki komutu kendi `User UID`niz ile güncelleyip çalıştırın:

```sql
UPDATE public.profiles
SET role = 'admin'
WHERE id = 'KOPYALADIGINIZ_USER_UID_BURAYA';
```

4.  **Kontrol Edin:**
    *   Artık bu kullanıcı ile giriş yaptığınızda RLS politikaları gereği tüm departmanların tablolarını görebilir ve silebilirsiniz.
