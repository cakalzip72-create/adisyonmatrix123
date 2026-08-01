import { ImageSection } from "@/components/landing/ImageSection";
import { LinkHotspot } from "@/components/landing/Hotspot";
import { MobileLanding } from "@/components/landing/MobileLanding";

export default function Home() {
  return (
    <>
      {/* Mobil: tasarım görselleri telefonda okunamayacak kadar küçüldüğü için
          aynı içeriğin gerçek HTML sürümü gösterilir. */}
      <MobileLanding />

      {/* Masaüstü: orijinal tasarım görselleri + tıklanabilir alanlar */}
      <div className="hidden min-h-screen flex-col bg-white lg:flex">
      {/* 1. Hero + navbar */}
      <ImageSection id="top" src="/landing/section-1.jpg" alt="AdisyonMatrix — Restoran Yönetimi, Daha Akıllı, Daha Kolay" priority>
        <LinkHotspot href="/" top={2} left={3.5} width={17} height={7} aria-label="AdisyonMatrix anasayfa" />
        <LinkHotspot href="#ozellikler" top={3.5} left={28} width={7} height={3.5} aria-label="Özellikler" />
        <LinkHotspot href="#cozumler" top={3.5} left={35.7} width={4.3} height={3.5} aria-label="Çözümler" />
        <LinkHotspot href="/onboarding/plan" top={3.5} left={41.5} width={8.2} height={3.5} aria-label="Fiyatlandırma" />
        <LinkHotspot href="#footer" top={3.5} left={50.7} width={5} height={3.5} aria-label="Kaynaklar" />
        <LinkHotspot href="#footer" top={3.5} left={57} width={5.3} height={3.5} aria-label="İletişim" />
        <LinkHotspot href="/login" top={2.3} left={81} width={7.2} height={5} aria-label="Giriş Yap" />
        <LinkHotspot href="/signup" top={2} left={88.3} width={7.4} height={6} aria-label="Demo İste" />
        <LinkHotspot href="/signup" top={46} left={5} width={14.5} height={5.5} aria-label="Ücretsiz Demo İste" />
        <LinkHotspot href="#ozellikler" top={46} left={20} width={14} height={5.5} aria-label="Özellikleri Keşfet" />
      </ImageSection>

      {/* 2. Sipariş yolculuğu */}
      <ImageSection src="/landing/section-2.png" alt="Siparişin Yolculuğunu İzleyin">
        <LinkHotspot href="#sorunlar" top={92} left={48.5} width={3} height={6} aria-label="Aşağı kaydır" />
      </ImageSection>

      {/* 3. Sorunlar */}
      <ImageSection id="sorunlar" src="/landing/section-3.png" alt="Restoran Yönetiminde Karşılaştığınız Sorunlar" />

      {/* 4. Tüm süreçler / çözümler */}
      <ImageSection id="cozumler" src="/landing/section-4.png" alt="Tüm Süreçleri Tek Platformda Yönetin">
        <LinkHotspot href="#ozellikler" top={72} left={3.5} width={15} height={4.5} aria-label="Tüm Özellikleri Keşfet" />
      </ImageSection>

      {/* 5. Özellikler + dashboard mockup */}
      <ImageSection id="ozellikler" src="/landing/section-5.png" alt="AdisyonMatrix ile Restoranınızı Geleceğe Taşıyın">
        <LinkHotspot href="/signup" top={74.5} left={3} width={13.5} height={5} aria-label="Tüm Özellikleri Keşfet" />
      </ImageSection>

      {/* 6. Analitik */}
      <ImageSection src="/landing/section-6.png" alt="Gerçek Zamanlı Analitik ile Doğru Kararlar Alın">
        <LinkHotspot href="/signup" top={79.5} left={3.5} width={11.5} height={5} aria-label="Raporları Keşfedin" />
      </ImageSection>

      {/* 7. Footer */}
      <ImageSection id="footer" src="/landing/section-7.png" alt="AdisyonMatrix Footer">
        <LinkHotspot href="/" top={14.5} left={4} width={22} height={7} aria-label="AdisyonMatrix anasayfa" />
        <LinkHotspot href="/onboarding/plan" top={30.5} left={30.5} width={9} height={3.5} aria-label="Fiyatlandırma" />
      </ImageSection>
      </div>
    </>
  );
}
