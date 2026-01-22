export type Language = "en" | "fr" | "ja";

export const translations = {
  en: {
    // Navbar
    nav: {
      home: "Home",
      market: "Market",
      business: "Business",
      flow: "Flow",
      company: "Company",
      contact: "Contact Us",
    },
    // Hero/Slideshow
    hero: {
      welcome: "Welcome to Ndong World Wide Trading",
      subtitle: "Your trusted partner for quality vehicles",
      tagline: "Quality Used Cars & Tyres, Directly From Japan to Your Driveway",
    },
    // Mission Section
    mission: {
      title: "Our Mission",
      text: "At Ndong World Wide Trading, we are committed to delivering high-quality used vehicles and tyres directly from Japan to customers worldwide. Our mission is to provide reliable, affordable, and well-maintained automobiles that meet the highest standards of safety and performance. We believe in building lasting relationships with our clients through transparency, integrity, and exceptional customer service.",
    },
    // Car Provision
    carProvision: {
      title: "Car Provision",
      description: "We specialize in sourcing and delivering premium quality used vehicles directly from Japan's renowned auto markets. Our extensive selection includes sedans, SUVs, trucks, and commercial vehicles - all thoroughly inspected and certified for reliability. Each vehicle undergoes rigorous quality checks to ensure it meets international standards before reaching your doorstep.",
      features: [
        "Certified pre-owned vehicles",
        "Complete maintenance history",
        "Competitive pricing",
        "Worldwide shipping available",
      ],
    },
    // Tyres Provision
    tyresProvision: {
      title: "Tyres Provision",
      description: "We offer a wide selection of high-quality used tyres sourced from Japan, known for their excellent road conditions and strict vehicle maintenance standards. Our tyres are carefully inspected for tread depth, sidewall integrity, and overall condition to ensure maximum safety and performance. Whether you need tyres for passenger vehicles, SUVs, or commercial trucks, we have you covered.",
      features: [
        "Thoroughly inspected for safety",
        "Multiple brands available",
        "Various sizes and types",
        "Affordable pricing",
      ],
    },
    // Wheels Provision
    wheelsProvision: {
      title: "Wheels Provision",
      description: "Upgrade your vehicle's appearance and performance with our premium selection of wheels imported directly from Japan. From elegant alloy wheels to durable steel rims, our collection features top brands and styles to match any vehicle. Each wheel is inspected for structural integrity, balance, and cosmetic condition to ensure you receive only the best quality products.",
      features: [
        "Alloy and steel options",
        "Various designs and finishes",
        "OEM and aftermarket brands",
        "Perfect fit guarantee",
      ],
    },
    // Footer
    footer: {
      quickLinks: "Quick Links",
      ourServices: "Our Services",
      address: "123 Business Street, Tokyo, Japan",
      copyright: "Ndong World Wide Trading. All rights reserved.",
    },
    // Market/Dashboard
    market: {
      title: "Car Inventory",
      totalCars: "Total Cars",
      addCar: "Add New Car",
      noCars: "No cars in inventory",
      noDescription: "Add your first car to get started",
      loading: "Loading...",
    },
    // Language
    language: {
      select: "Language",
      english: "English",
      french: "French",
      japanese: "Japanese",
    },
    // Flow/Export Process
    flow: {
      title: "Export Process Flow",
      subtitle: "Understanding our streamlined container export process for international and local buyers",
      internationalTitle: "International Customers",
      internationalSubtitle: "Full container exports (20ft/40ft) with vehicles, tyres, and motor spare parts to your specifications",
      localTitle: "Local Buyers in Japan",
      localSubtitle: "For buyers in Japan who want to purchase and export vehicles independently",
      steps: {
        international: [
          {
            title: "Inquiry & Order Consultation",
            description: "Contact us via website, email, or phone with your order requirements. Specify your desired vehicles, tyre sizes (new or used), motor spare parts, quantities, and preferred container size (20ft or 40ft).",
          },
          {
            title: "Sourcing & Quotation",
            description: "We source vehicles from Japanese auctions and our inventory, plus tyres and motor spare parts matching your exact specifications. You'll receive a detailed quotation for the full container load.",
          },
          {
            title: "Order Confirmation & Deposit",
            description: "Review and confirm your order. A deposit (typically 30-50%) secures your container booking. We begin sourcing and collecting your specified vehicles, tyres, and spare parts.",
          },
          {
            title: "Inspection & Container Loading",
            description: "All vehicles are inspected and prepared. Tyres and spare parts are sorted by your specifications. Everything is carefully loaded into your 20ft or 40ft container, maximizing space efficiently.",
          },
          {
            title: "Export Documentation",
            description: "We prepare all export paperwork: Export Certificates, Bill of Lading, Commercial Invoice, Packing List with vehicle details, tyre and spare parts specifications for customs clearance.",
          },
          {
            title: "Final Payment & Shipping",
            description: "Complete the remaining balance before shipping. Your container is dispatched to your destination port. You'll receive the Bill of Lading and tracking information.",
          },
          {
            title: "Customs Clearance Support",
            description: "We provide all documentation needed for customs clearance in your country. Our team assists with any questions throughout the import process.",
          },
          {
            title: "Container Arrival & After-Sales",
            description: "Your container arrives at the destination port ready for collection. We remain available for after-sales support and your next container order.",
          },
        ],
        local: [
          {
            title: "Inquiry & Consultation",
            description: "Contact us via phone, email, or visit our yard in Japan. Browse our available export-ready inventory and discuss your requirements with our sales team.",
          },
          {
            title: "Vehicle Selection & Inspection",
            description: "Inspect your chosen vehicle in person at our yard. Our staff will explain the vehicle's history, condition, auction grade, and export suitability.",
          },
          {
            title: "Price Negotiation & Agreement",
            description: "We'll work with you to reach a fair price. Once agreed, we prepare the sales agreement for your independent export.",
          },
          {
            title: "Payment & Ownership Transfer",
            description: "Complete the payment via bank transfer or other accepted methods. We handle the deregistration (Matsuyo-Tehai) and prepare export-ready documentation.",
          },
          {
            title: "Export Documentation Support",
            description: "We provide the Export Certificate, deregistration papers, and all necessary documents you need to arrange your own shipping and customs clearance.",
          },
          {
            title: "Vehicle Handover",
            description: "Collect your vehicle from our yard or arrange your own transport to the port. All documentation, keys, and export papers are handed over for your independent shipping.",
          },
        ],
      },
      contactCta: "Ready to Start?",
      contactButton: "Contact Us Today",
    },
    // Company
    company: {
      title: "Company Profile",
      profileTitle: "Company Information",
      name: "Company Name",
      companyLocation: "Company Location",
      companyLocationValue: "342-0001 226-1 Kamiuchikawa, Yoshikawa City, Saitama Prefecture",
      companyOffice: "Company Office",
      companyOfficeValue: "344-0114 1350-5 Higashinakano, Kasukabe City, Saitama Prefecture",
      established: "Established",
      establishedValue: "April 27, 2011",
      capital: "Capital",
      yen: "yen",
      representative: "Representative",
      representativeValue: "Yokomo Hitomi\nTebit Fidglas Fon",
      businessDetails: "Business Details",
      businessDescription: "Tire and car export",
      license: "Secondhand Goods Dealer License",
      licenseDescription: "1030001053530",
    },
    // Contact
    contact: {
      heroTitle: "Inquiry",
      heroSubtitle: "We look forward to hearing from you",
      step1: "Enter Details",
      step2: "Review & Confirm",
      step3: "Complete",
      formTitle: "Contact Form",
      requiredNote: "* indicates required fields",
      name: "Name",
      namePlaceholder: "Enter your full name",
      furigana: "Furigana",
      furiganaPlaceholder: "Enter name pronunciation",
      email: "Email Address",
      emailPlaceholder: "Enter your email address",
      phone: "Telephone Number",
      phonePlaceholder: "Enter your phone number",
      inquiryDetails: "Inquiry Details",
      inquiryPlaceholder: "Please enter your inquiry details here",
      nextButton: "Proceed to Confirmation",
      confirmTitle: "Confirm Your Information",
      confirmSubtitle: "Please review the information below before submitting",
      backButton: "Back",
      submitButton: "Submit",
      completeTitle: "Submission Complete",
      completeMessage: "Thank you for your inquiry. We will respond to you shortly.",
      newInquiryButton: "Submit Another Inquiry",
      errors: {
        nameRequired: "Name is required",
        furiganaRequired: "Furigana is required",
        emailRequired: "Email address is required",
        emailInvalid: "Please enter a valid email address",
        phoneRequired: "Telephone number is required",
      },
    },
  },
  fr: {
    // Navbar
    nav: {
      home: "Accueil",
      market: "Marché",
      business: "Affaires",
      flow: "Flux",
      company: "Entreprise",
      contact: "Contactez-nous",
    },
    // Hero/Slideshow
    hero: {
      welcome: "Bienvenue chez Ndong World Wide Trading",
      subtitle: "Votre partenaire de confiance pour des véhicules de qualité",
      tagline: "Voitures et Pneus d'Occasion de Qualité, Directement du Japon à Votre Porte",
    },
    // Mission Section
    mission: {
      title: "Notre Mission",
      text: "Chez Ndong World Wide Trading, nous nous engageons à livrer des véhicules et des pneus d'occasion de haute qualité directement du Japon aux clients du monde entier. Notre mission est de fournir des automobiles fiables, abordables et bien entretenues qui répondent aux normes les plus élevées de sécurité et de performance. Nous croyons en l'établissement de relations durables avec nos clients grâce à la transparence, l'intégrité et un service client exceptionnel.",
    },
    // Car Provision
    carProvision: {
      title: "Fourniture de Voitures",
      description: "Nous sommes spécialisés dans l'approvisionnement et la livraison de véhicules d'occasion de qualité premium directement des marchés automobiles renommés du Japon. Notre vaste sélection comprend des berlines, des SUV, des camions et des véhicules commerciaux - tous soigneusement inspectés et certifiés pour leur fiabilité. Chaque véhicule subit des contrôles de qualité rigoureux pour s'assurer qu'il répond aux normes internationales avant d'arriver chez vous.",
      features: [
        "Véhicules d'occasion certifiés",
        "Historique d'entretien complet",
        "Prix compétitifs",
        "Expédition mondiale disponible",
      ],
    },
    // Tyres Provision
    tyresProvision: {
      title: "Fourniture de Pneus",
      description: "Nous offrons une large sélection de pneus d'occasion de haute qualité provenant du Japon, connu pour ses excellentes conditions routières et ses normes strictes d'entretien des véhicules. Nos pneus sont soigneusement inspectés pour la profondeur de la bande de roulement, l'intégrité des flancs et l'état général pour assurer une sécurité et des performances maximales.",
      features: [
        "Soigneusement inspectés pour la sécurité",
        "Plusieurs marques disponibles",
        "Différentes tailles et types",
        "Prix abordables",
      ],
    },
    // Wheels Provision
    wheelsProvision: {
      title: "Fourniture de Roues",
      description: "Améliorez l'apparence et les performances de votre véhicule avec notre sélection premium de roues importées directement du Japon. Des jantes en alliage élégantes aux jantes en acier durables, notre collection présente les meilleures marques et styles pour correspondre à tout véhicule.",
      features: [
        "Options alliage et acier",
        "Différents designs et finitions",
        "Marques OEM et aftermarket",
        "Garantie d'ajustement parfait",
      ],
    },
    // Footer
    footer: {
      quickLinks: "Liens Rapides",
      ourServices: "Nos Services",
      address: "123 Rue des Affaires, Tokyo, Japon",
      copyright: "Ndong World Wide Trading. Tous droits réservés.",
    },
    // Market/Dashboard
    market: {
      title: "Inventaire des Voitures",
      totalCars: "Total des Voitures",
      addCar: "Ajouter une Voiture",
      noCars: "Aucune voiture en stock",
      noDescription: "Ajoutez votre première voiture pour commencer",
      loading: "Chargement...",
    },
    // Language
    language: {
      select: "Langue",
      english: "Anglais",
      french: "Français",
      japanese: "Japonais",
    },
    // Flow/Export Process
    flow: {
      title: "Processus d'Exportation",
      subtitle: "Comprendre notre processus d'exportation par conteneur pour les clients internationaux et acheteurs locaux",
      internationalTitle: "Clients Internationaux",
      internationalSubtitle: "Exportations en conteneur complet (20ft/40ft) avec véhicules, pneus et pièces détachées selon vos spécifications",
      localTitle: "Acheteurs Locaux au Japon",
      localSubtitle: "Pour les acheteurs au Japon qui souhaitent acheter et exporter des véhicules de manière indépendante",
      steps: {
        international: [
          {
            title: "Demande et Consultation de Commande",
            description: "Contactez-nous via notre site web, email ou téléphone avec vos exigences. Spécifiez vos véhicules souhaités, tailles de pneus (neufs ou usagés), pièces détachées, quantités et taille de conteneur préférée (20ft ou 40ft).",
          },
          {
            title: "Approvisionnement et Devis",
            description: "Nous sourçons les véhicules des enchères japonaises et de notre inventaire, plus les pneus et pièces détachées correspondant à vos spécifications exactes. Vous recevrez un devis détaillé pour le chargement complet du conteneur.",
          },
          {
            title: "Confirmation de Commande et Acompte",
            description: "Examinez et confirmez votre commande. Un acompte (généralement 30-50%) sécurise votre réservation de conteneur. Nous commençons l'approvisionnement et la collecte de vos véhicules, pneus et pièces détachées spécifiés.",
          },
          {
            title: "Inspection et Chargement du Conteneur",
            description: "Tous les véhicules sont inspectés et préparés. Les pneus et pièces détachées sont triés selon vos spécifications. Tout est soigneusement chargé dans votre conteneur de 20ft ou 40ft, maximisant l'espace efficacement.",
          },
          {
            title: "Documentation d'Exportation",
            description: "Nous préparons tous les documents d'exportation: Certificats d'Exportation, Connaissement, Facture Commerciale, Liste de Colisage avec détails des véhicules, pneus et pièces détachées pour le dédouanement.",
          },
          {
            title: "Paiement Final et Expédition",
            description: "Complétez le solde restant avant l'expédition. Votre conteneur est expédié vers votre port de destination. Vous recevrez le Connaissement et les informations de suivi.",
          },
          {
            title: "Support au Dédouanement",
            description: "Nous fournissons toute la documentation nécessaire pour le dédouanement dans votre pays. Notre équipe vous assiste pour toutes questions tout au long du processus d'importation.",
          },
          {
            title: "Arrivée du Conteneur et Après-Vente",
            description: "Votre conteneur arrive au port de destination prêt pour la collecte. Nous restons disponibles pour le support après-vente et votre prochaine commande de conteneur.",
          },
        ],
        local: [
          {
            title: "Demande et Consultation",
            description: "Contactez-nous par téléphone, email ou visitez notre parc au Japon. Parcourez notre inventaire prêt à l'exportation et discutez de vos besoins avec notre équipe de vente.",
          },
          {
            title: "Sélection et Inspection du Véhicule",
            description: "Inspectez votre véhicule choisi en personne dans notre parc. Notre personnel vous expliquera l'historique du véhicule, son état, sa note d'enchères et son aptitude à l'exportation.",
          },
          {
            title: "Négociation du Prix et Accord",
            description: "Nous travaillerons avec vous pour atteindre un prix équitable. Une fois convenu, nous préparons le contrat de vente pour votre exportation indépendante.",
          },
          {
            title: "Paiement et Transfert de Propriété",
            description: "Complétez le paiement par virement bancaire ou autres méthodes acceptées. Nous gérons la radiation (Matsuyo-Tehai) et préparons la documentation prête à l'exportation.",
          },
          {
            title: "Support Documentation Export",
            description: "Nous fournissons le Certificat d'Exportation, les documents de radiation et tous les documents nécessaires pour organiser votre propre expédition et dédouanement.",
          },
          {
            title: "Remise du Véhicule",
            description: "Récupérez votre véhicule dans notre parc ou organisez votre propre transport vers le port. Tous les documents, clés et papiers d'exportation vous sont remis pour votre expédition indépendante.",
          },
        ],
      },
      contactCta: "Prêt à Commencer?",
      contactButton: "Contactez-nous Aujourd'hui",
    },
    // Company
    company: {
      title: "Profil de l'Entreprise",
      profileTitle: "Informations sur l'Entreprise",
      name: "Nom de l'Entreprise",
      companyLocation: "Emplacement de l'Entreprise",
      companyLocationValue: "342-0001 226-1 Kamiuchikawa, Ville de Yoshikawa, Préfecture de Saitama",
      companyOffice: "Bureau de l'Entreprise",
      companyOfficeValue: "344-0114 1350-5 Higashinakano, Ville de Kasukabe, Préfecture de Saitama",
      established: "Établi",
      establishedValue: "27 avril 2011",
      capital: "Capital",
      yen: "yen",
      representative: "Représentant",
      representativeValue: "Yokomo Hitomi\nTebit Fidglas Fon",
      businessDetails: "Détails de l'Activité",
      businessDescription: "Exportation de pneus et voitures",
      license: "Licence de Revendeur de Biens d'Occasion",
      licenseDescription: "1030001053530",
    },
    // Contact
    contact: {
      heroTitle: "Demande de Renseignements",
      heroSubtitle: "Nous avons hâte de vous entendre",
      step1: "Saisir les Détails",
      step2: "Vérifier et Confirmer",
      step3: "Terminé",
      formTitle: "Formulaire de Contact",
      requiredNote: "* indique les champs obligatoires",
      name: "Nom",
      namePlaceholder: "Entrez votre nom complet",
      furigana: "Furigana",
      furiganaPlaceholder: "Entrez la prononciation du nom",
      email: "Adresse Email",
      emailPlaceholder: "Entrez votre adresse email",
      phone: "Numéro de Téléphone",
      phonePlaceholder: "Entrez votre numéro de téléphone",
      inquiryDetails: "Détails de la Demande",
      inquiryPlaceholder: "Veuillez entrer les détails de votre demande ici",
      nextButton: "Passer à la Confirmation",
      confirmTitle: "Confirmer Vos Informations",
      confirmSubtitle: "Veuillez vérifier les informations ci-dessous avant de soumettre",
      backButton: "Retour",
      submitButton: "Soumettre",
      completeTitle: "Soumission Terminée",
      completeMessage: "Merci pour votre demande. Nous vous répondrons dans les plus brefs délais.",
      newInquiryButton: "Soumettre une Autre Demande",
      errors: {
        nameRequired: "Le nom est requis",
        furiganaRequired: "Le furigana est requis",
        emailRequired: "L'adresse email est requise",
        emailInvalid: "Veuillez entrer une adresse email valide",
        phoneRequired: "Le numéro de téléphone est requis",
      },
    },
  },
  ja: {
    // Navbar
    nav: {
      home: "ホーム",
      market: "マーケット",
      business: "ビジネス",
      flow: "フロー",
      company: "会社",
      contact: "お問い合わせ",
    },
    // Hero/Slideshow
    hero: {
      welcome: "Ndong World Wide Tradingへようこそ",
      subtitle: "高品質な車両のための信頼できるパートナー",
      tagline: "日本から直接お届けする高品質な中古車とタイヤ",
    },
    // Mission Section
    mission: {
      title: "私たちの使命",
      text: "Ndong World Wide Tradingでは、日本から世界中のお客様に高品質な中古車とタイヤを直接お届けすることに尽力しています。私たちの使命は、安全性と性能の最高基準を満たす、信頼性が高く、手頃な価格で、よく整備された自動車を提供することです。透明性、誠実さ、そして卓越したカスタマーサービスを通じて、お客様との永続的な関係を築くことを信じています。",
    },
    // Car Provision
    carProvision: {
      title: "自動車供給",
      description: "私たちは日本の有名な自動車市場から直接、プレミアム品質の中古車を調達し、お届けすることを専門としています。セダン、SUV、トラック、商用車など、すべて徹底的に検査され、信頼性が認証されています。各車両は、お客様のもとに届く前に国際基準を満たすことを確認するための厳格な品質チェックを受けます。",
      features: [
        "認定中古車",
        "完全な整備履歴",
        "競争力のある価格",
        "世界中への配送可能",
      ],
    },
    // Tyres Provision
    tyresProvision: {
      title: "タイヤ供給",
      description: "優れた道路状況と厳格な車両整備基準で知られる日本から調達した高品質な中古タイヤを幅広く取り揃えています。当社のタイヤは、トレッド深さ、サイドウォールの完全性、全体的な状態について慎重に検査され、最大の安全性とパフォーマンスを確保しています。",
      features: [
        "安全性を徹底的に検査",
        "複数のブランドを用意",
        "様々なサイズとタイプ",
        "手頃な価格",
      ],
    },
    // Wheels Provision
    wheelsProvision: {
      title: "ホイール供給",
      description: "日本から直接輸入したプレミアムホイールセレクションで、車両の外観とパフォーマンスをアップグレードしましょう。エレガントなアルミホイールから耐久性のあるスチールリムまで、あらゆる車両に合うトップブランドとスタイルを取り揃えています。",
      features: [
        "アルミとスチールのオプション",
        "様々なデザインと仕上げ",
        "OEMとアフターマーケットブランド",
        "完璧なフィット保証",
      ],
    },
    // Footer
    footer: {
      quickLinks: "クイックリンク",
      ourServices: "サービス",
      address: "〒123-4567 東京都ビジネス通り123",
      copyright: "Ndong World Wide Trading. 全著作権所有。",
    },
    // Market/Dashboard
    market: {
      title: "車両在庫",
      totalCars: "総車両数",
      addCar: "新しい車を追加",
      noCars: "在庫に車がありません",
      noDescription: "最初の車を追加して始めましょう",
      loading: "読み込み中...",
    },
    // Language
    language: {
      select: "言語",
      english: "英語",
      french: "フランス語",
      japanese: "日本語",
    },
    // Flow/Export Process
    flow: {
      title: "輸出プロセスフロー",
      subtitle: "海外のお客様および国内バイヤー様向けのコンテナ輸出プロセスをご理解ください",
      internationalTitle: "海外のお客様",
      internationalSubtitle: "お客様のご要望に応じた車両、タイヤ、自動車部品のフルコンテナ輸出（20ft/40ft）",
      localTitle: "日本国内のバイヤー様",
      localSubtitle: "ご自身で輸出される日本国内のバイヤー様向けプロセス",
      steps: {
        international: [
          {
            title: "お問い合わせ・ご注文相談",
            description: "ウェブサイト、メール、または電話でご注文のご要望をお知らせください。ご希望の車両、タイヤサイズ（新品または中古）、自動車部品、数量、コンテナサイズ（20ftまたは40ft）をご指定ください。",
          },
          {
            title: "調達・お見積り",
            description: "日本のオークションと当社の在庫から車両を調達し、お客様の正確な仕様に合うタイヤと自動車部品をご用意します。フルコンテナ積載の詳細なお見積りをお送りします。",
          },
          {
            title: "ご注文確認・手付金",
            description: "ご注文内容をご確認ください。手付金（通常30-50%）でコンテナの予約を確保します。ご指定の車両、タイヤ、部品の調達・収集を開始します。",
          },
          {
            title: "検査・コンテナ積込",
            description: "すべての車両を検査し準備します。タイヤと部品はお客様の仕様に従って仕分けします。20ftまたは40ftコンテナにスペースを最大限活用して丁寧に積み込みます。",
          },
          {
            title: "輸出書類作成",
            description: "輸出証明書、船荷証券、商業送り状、車両詳細・タイヤ・部品の仕様を記載したパッキングリストなど、通関に必要なすべての輸出書類を準備します。",
          },
          {
            title: "残金お支払い・出荷",
            description: "出荷前に残金をお支払いください。コンテナは目的地の港に向けて発送されます。船荷証券と追跡情報をお送りします。",
          },
          {
            title: "通関サポート",
            description: "お客様の国での通関に必要なすべての書類を提供します。輸入プロセス全体を通じてご質問にお答えします。",
          },
          {
            title: "コンテナ到着・アフターサービス",
            description: "コンテナが目的地の港に到着し、お引き取りの準備が整います。アフターサービスや次回のコンテナご注文についても引き続きサポートいたします。",
          },
        ],
        local: [
          {
            title: "お問い合わせ・ご相談",
            description: "電話、メール、または日本のヤードにお越しください。輸出可能な在庫をご覧いただき、営業チームとご要望についてご相談ください。",
          },
          {
            title: "車両選択・検査",
            description: "当社のヤードでご希望の車両を直接ご確認いただけます。スタッフが車両の履歴、状態、オークション評価点、輸出適合性についてご説明します。",
          },
          {
            title: "価格交渉・合意",
            description: "公正な価格に達するよう一緒に取り組みます。合意後、お客様の独自輸出のための売買契約書を準備します。",
          },
          {
            title: "お支払い・名義変更",
            description: "銀行振込またはその他の受け入れられる方法でお支払いを完了してください。抹消手配を行い、輸出用書類を準備します。",
          },
          {
            title: "輸出書類サポート",
            description: "輸出証明書、抹消書類、ご自身で船積みと通関を手配するために必要なすべての書類を提供します。",
          },
          {
            title: "車両お引き渡し",
            description: "当社のヤードで車両をお引き取りいただくか、ご自身で港への輸送を手配してください。すべての書類、鍵、輸出用書類をお渡しします。",
          },
        ],
      },
      contactCta: "始める準備はできましたか？",
      contactButton: "今すぐお問い合わせ",
    },
    // Company
    company: {
      title: "会社概要",
      profileTitle: "会社情報",
      name: "会社名",
      companyLocation: "会社所在地",
      companyLocationValue: "〒342-0001 埼玉県吉川市大字上内川２２６番地１",
      companyOffice: "事務所",
      companyOfficeValue: "〒344-0114 埼玉県春日部市東中野1350-5",
      established: "設立",
      establishedValue: "2011年4月27日",
      capital: "資本金",
      yen: "円",
      representative: "代表者",
      representativeValue: "陽子 ひとみ\nテビット・フィドグラス・フォン",
      businessDetails: "事業内容",
      businessDescription: "タイヤ及び自動車の輸出",
      license: "古物商許可証",
      licenseDescription: "1030001053530",
    },
    // Contact
    contact: {
      heroTitle: "お問い合わせ",
      heroSubtitle: "お気軽にご連絡ください",
      step1: "情報入力",
      step2: "内容確認",
      step3: "送信完了",
      formTitle: "お問い合わせフォーム",
      requiredNote: "※は必須項目です",
      name: "お名前",
      namePlaceholder: "お名前を入力してください",
      furigana: "フリガナ",
      furiganaPlaceholder: "フリガナを入力してください",
      email: "メールアドレス",
      emailPlaceholder: "メールアドレスを入力してください",
      phone: "電話番号",
      phonePlaceholder: "電話番号を入力してください",
      inquiryDetails: "お問い合わせ内容",
      inquiryPlaceholder: "お問い合わせ内容をご記入ください",
      nextButton: "確認画面へ進む",
      confirmTitle: "入力内容の確認",
      confirmSubtitle: "以下の内容をご確認の上、送信してください",
      backButton: "戻る",
      submitButton: "送信する",
      completeTitle: "送信完了",
      completeMessage: "お問い合わせいただきありがとうございます。担当者より折り返しご連絡いたします。",
      newInquiryButton: "新しいお問い合わせ",
      errors: {
        nameRequired: "お名前は必須です",
        furiganaRequired: "フリガナは必須です",
        emailRequired: "メールアドレスは必須です",
        emailInvalid: "有効なメールアドレスを入力してください",
        phoneRequired: "電話番号は必須です",
      },
    },
  },
};

export type Translations = typeof translations.en;
