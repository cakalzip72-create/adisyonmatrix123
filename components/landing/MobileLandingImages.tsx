import { MobileImageSection } from "@/components/landing/MobileImageSection";
import { MobileMenu } from "@/components/landing/MobileMenu";
import { LinkHotspot } from "@/components/landing/Hotspot";
import { SALES_WHATSAPP_NUMBER } from "@/lib/whatsapp";

/**
 * Mobil açılış sayfası — masaüstündeki yaklaşımın birebir aynısı:
 * tasarım görselleri tam genişlikte akar, tıklanabilir alanlar yüzde
 * konumlarla görselin üstüne bindirilir.
 *
 * Görseller 941x1672 (9:16) olarak dışa aktarıldı; hotspot yüzdeleri de
 * bu tuvale göre ölçüldüğü için her ekran genişliğinde hizada kalır.
 */
export function MobileLandingImages() {
  return (
    <div className="flex min-h-screen flex-col bg-white lg:hidden">
      {/* 1. Hero */}
      <MobileImageSection
        id="top"
        src="/landing-mobile/section-1.png"
        alt="AdisyonMatrix — Restoran Yönetimi, Daha Akıllı, Daha Kolay"
        priority
      >
        <LinkHotspot href="/" top={0.8} left={3.5} width={27} height={3.8} aria-label="AdisyonMatrix anasayfa" />
        <MobileMenu top={0.8} left={86.5} width={10} height={3.8} />
        <LinkHotspot href="/signup" top={33.2} left={4.8} width={29} height={4} aria-label="Ücretsiz Demo İste" />
        <LinkHotspot href="#ozellikler" top={38.6} left={4.8} width={26.5} height={3.4} aria-label="Özellikleri Keşfet" />
      </MobileImageSection>

      {/* 2. Sipariş yolculuğu */}
      <MobileImageSection src="/landing-mobile/section-2.png" alt="Siparişin Yolculuğunu İzleyin">
        <LinkHotspot href="/" top={2.2} left={3.5} width={27} height={4} aria-label="AdisyonMatrix anasayfa" />
        <MobileMenu top={2.2} left={86.5} width={10} height={4} />
        <LinkHotspot href="#sorunlar" top={90.5} left={42} width={16} height={8} aria-label="Aşağı kaydır" />
      </MobileImageSection>

      {/* 3. Sorunlar */}
      <MobileImageSection id="sorunlar" src="/landing-mobile/section-3.png" alt="Restoran Yönetiminde Karşılaştığınız Sorunlar">
        <LinkHotspot href="#cozumler" top={95.8} left={43} width={14} height={3.6} aria-label="Aşağı kaydır" />
      </MobileImageSection>

      {/* 4. Çözümler */}
      <MobileImageSection id="cozumler" src="/landing-mobile/section-4.png" alt="Tüm Süreçleri Tek Platformda Yönetin">
        <LinkHotspot href="/" top={0.6} left={3.5} width={27} height={3.8} aria-label="AdisyonMatrix anasayfa" />
        <MobileMenu top={0.6} left={86} width={10} height={3.8} />
        <LinkHotspot href="#ozellikler" top={75.8} left={8.3} width={83.5} height={4} aria-label="Tüm Özellikleri Keşfet" />
      </MobileImageSection>

      {/* 5. Özellikler */}
      <MobileImageSection id="ozellikler" src="/landing-mobile/section-5.png" alt="AdisyonMatrix ile Restoranınızı Geleceğe Taşıyın">
        <LinkHotspot href="/" top={0.8} left={3.5} width={27} height={3.8} aria-label="AdisyonMatrix anasayfa" />
        <MobileMenu top={0.8} left={87.5} width={9.5} height={3.8} />
        <LinkHotspot href="/signup" top={74.8} left={4.8} width={28.5} height={3.9} aria-label="Tüm Özellikleri Keşfet" />
        <LinkHotspot href="#cozumler" top={79.5} left={4.5} width={28} height={3.5} aria-label="2 Dakikada AdisyonMatrix" />
        <LinkHotspot href="#iletisim" top={94.2} left={39} width={24} height={3.6} aria-label="Tüm Referanslar" />
      </MobileImageSection>

      {/* 6. Analitik */}
      <MobileImageSection id="analitik" src="/landing-mobile/section-6.png" alt="Gerçek Zamanlı Analitik ile Doğru Kararlar Alın">
        <LinkHotspot href="/signup" top={44.8} left={19} width={22.5} height={3.7} aria-label="Raporları Keşfedin" />
        <LinkHotspot href="#cozumler" top={45} left={44} width={20} height={3.5} aria-label="2 Dakikalık Demo" />
      </MobileImageSection>

      {/* 7. Footer */}
      <MobileImageSection id="iletisim" src="/landing-mobile/section-7.png" alt="AdisyonMatrix iletişim ve footer">
        <LinkHotspot href="/" top={1.5} left={3.5} width={30} height={4} aria-label="AdisyonMatrix anasayfa" />
        <MobileMenu top={1.5} left={86.5} width={10} height={4} tone="dark" />
        <LinkHotspot
          href="https://folderdc.com"
          target="_blank"
          rel="noreferrer"
          top={50.8}
          left={8}
          width={84}
          height={3.2}
          aria-label="FolderDC.com"
        />
        <LinkHotspot href="mailto:Support@folderdc.com" top={54.2} left={8} width={84} height={3} aria-label="Support@folderdc.com" />
        <LinkHotspot href={`tel:+${SALES_WHATSAPP_NUMBER}`} top={57.3} left={8} width={84} height={3} aria-label="Telefon ile arayın" />
        <LinkHotspot
          href={`https://wa.me/${SALES_WHATSAPP_NUMBER}`}
          target="_blank"
          rel="noreferrer"
          top={60.4}
          left={8}
          width={84}
          height={3.2}
          aria-label="WhatsApp Destek"
        />
      </MobileImageSection>
    </div>
  );
}
