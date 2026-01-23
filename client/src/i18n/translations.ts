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
      title: "Market",
      totalCars: "Total Cars",
      addCar: "Add New Car",
      noCars: "No cars in inventory",
      noDescription: "Add your first car to get started",
      loading: "Loading...",
      tabs: {
        cars: "Cars",
        newTires: "New Tires",
        usedTires: "Used Tires",
        wheelDrums: "Wheel Drums",
      },
      noItems: "No items available",
      checkBack: "Check back later for new listings.",
      mileage: "Mileage",
      fuel: "Fuel",
      transmission: "Trans.",
      contactSeller: "Contact Seller",
      conditionNew: "New",
      conditionUsed: "Used",
    },
    // Language
    language: {
      select: "Language",
      english: "English",
      french: "French",
      japanese: "Japanese",
    },
    // Flow
    flow: {
      title: "Purchase Flow",
      subtitle: "Simple steps to get your vehicle from Japan",
      international: {
        title: "International Customers",
        subtitle: "Export Service Worldwide",
        steps: [
          {
            step: "1",
            title: "Initial Inquiry",
            description: "Contact us via email, phone, or our contact form with your requirements. Tell us what vehicles, tyres, or parts you're looking for.",
          },
          {
            step: "2",
            title: "Consultation & Quotation",
            description: "Our team discusses your needs, provides recommendations, and sends you a detailed quotation including vehicle costs, shipping options (20ft or 40ft container), and export fees.",
          },
          {
            step: "3",
            title: "Vehicle Sourcing & Inspection",
            description: "We source your desired goods from trusted Japanese auctions and dealers. Our team conducts thorough inspections and sends you detailed photos and condition reports.",
          },
          {
            step: "4",
            title: "Payment & Purchase",
            description: "Once you approve, we proceed with the purchase. Payment can be made via bank transfer. We handle all purchasing procedures on your behalf.",
          },
          {
            step: "5",
            title: "Export Documentation",
            description: "We prepare all necessary export documents including deregistration certificates, export customs paperwork, Bill of Lading, and shipping invoices.",
          },
          {
            step: "6",
            title: "Container Loading & Shipping",
            description: "Your goods are carefully loaded into your chosen container size (20ft or 40ft) and shipped to your destination port. We provide tracking information throughout.",
          },
          {
            step: "7",
            title: "After-Sales Support",
            description: "Our service doesn't end at shipping. We provide ongoing support for any questions about customs clearance at your destination and future orders.",
          },
        ],
      },
      local: {
        title: "Local Customers (Japan)",
        subtitle: "Domestic Service",
        steps: [
          {
            step: "1",
            title: "Initial Inquiry",
            description: "Contact us via phone, email, or visit our yard directly. Let us know what vehicles, tyres, or parts you're interested in.",
          },
          {
            step: "2",
            title: "Consultation & Quote",
            description: "We discuss your requirements and provide a competitive quote. You're welcome to visit our yard to inspect available inventory in person.",
          },
          {
            step: "3",
            title: "Vehicle Selection",
            description: "Browse our yard inventory or request specific items. We can also source vehicles from auctions based on your specifications.",
          },
          {
            step: "4",
            title: "Payment & Documentation",
            description: "Complete the payment and we handle all necessary paperwork to get your vehicle ready for export.",
          },
          {
            step: "5",
            title: "Pickup or Delivery",
            description: "Pick up your purchase directly from our yard, or we can arrange delivery to your location based on negotiation. Flexible options available.",
          },
          {
            step: "6",
            title: "After-Service Support",
            description: "We maintain relationships with our customers. Contact us anytime for questions, future purchases, or recommendations.",
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
      title: "Marché",
      totalCars: "Total des Voitures",
      addCar: "Ajouter une Voiture",
      noCars: "Aucune voiture en stock",
      noDescription: "Ajoutez votre première voiture pour commencer",
      loading: "Chargement...",
      tabs: {
        cars: "Voitures",
        newTires: "Pneus Neufs",
        usedTires: "Pneus Usagés",
        wheelDrums: "Tambours de Roue",
      },
      noItems: "Aucun article disponible",
      checkBack: "Revenez plus tard pour de nouvelles annonces.",
      mileage: "Kilométrage",
      fuel: "Carburant",
      transmission: "Trans.",
      contactSeller: "Contacter le Vendeur",
      conditionNew: "Neuf",
      conditionUsed: "Usagé",
    },
    // Language
    language: {
      select: "Langue",
      english: "Anglais",
      french: "Français",
      japanese: "Japonais",
    },
    // Flow
    flow: {
      title: "Processus d'Achat",
      subtitle: "Étapes simples pour obtenir votre véhicule du Japon",
      international: {
        title: "Clients Internationaux",
        subtitle: "Service d'Exportation Mondial",
        steps: [
          {
            step: "1",
            title: "Demande Initiale",
            description: "Contactez-nous par email, téléphone ou via notre formulaire avec vos besoins. Dites-nous quels véhicules, pneus ou pièces vous recherchez.",
          },
          {
            step: "2",
            title: "Consultation et Devis",
            description: "Notre équipe discute de vos besoins, fournit des recommandations et vous envoie un devis détaillé incluant les coûts du véhicule, les options d'expédition (conteneur 20 ou 40 pieds) et les frais d'exportation.",
          },
          {
            step: "3",
            title: "Approvisionnement et Inspection",
            description: "Nous trouvons vos marchandises auprès des enchères et concessionnaires japonais de confiance. Notre équipe effectue des inspections approfondies et vous envoie des photos détaillées et des rapports d'état.",
          },
          {
            step: "4",
            title: "Paiement et Achat",
            description: "Une fois approuvé, nous procédons à l'achat. Le paiement peut être effectué par virement bancaire. Nous gérons toutes les procédures d'achat en votre nom.",
          },
          {
            step: "5",
            title: "Documentation d'Exportation",
            description: "Nous préparons tous les documents d'exportation nécessaires, y compris les certificats de radiation, les documents douaniers d'exportation, le connaissement et les factures d'expédition.",
          },
          {
            step: "6",
            title: "Chargement et Expédition",
            description: "Vos marchandises sont soigneusement chargées dans le conteneur de votre choix (20 ou 40 pieds) et expédiées vers votre port de destination. Nous fournissons des informations de suivi tout au long du processus.",
          },
          {
            step: "7",
            title: "Support Après-Vente",
            description: "Notre service ne s'arrête pas à l'expédition. Nous fournissons un support continu pour toutes questions concernant le dédouanement à destination et les commandes futures.",
          },
        ],
      },
      local: {
        title: "Clients Locaux (Japon)",
        subtitle: "Service Domestique",
        steps: [
          {
            step: "1",
            title: "Demande Initiale",
            description: "Contactez-nous par téléphone, email ou visitez directement notre parc. Faites-nous savoir quels véhicules, pneus ou pièces vous intéressent.",
          },
          {
            step: "2",
            title: "Consultation et Devis",
            description: "Nous discutons de vos besoins et fournissons un devis compétitif. Vous êtes invité à visiter notre parc pour inspecter l'inventaire disponible en personne.",
          },
          {
            step: "3",
            title: "Sélection du Véhicule",
            description: "Parcourez notre inventaire ou demandez des articles spécifiques. Nous pouvons également trouver des véhicules aux enchères selon vos spécifications.",
          },
          {
            step: "4",
            title: "Paiement et Documentation",
            description: "Complétez le paiement et nous gérons tous les documents nécessaires pour préparer votre véhicule à l'exportation.",
          },
          {
            step: "5",
            title: "Enlèvement ou Livraison",
            description: "Récupérez votre achat directement depuis notre parc, ou nous pouvons organiser la livraison à votre emplacement selon négociation. Options flexibles disponibles.",
          },
          {
            step: "6",
            title: "Support Après-Service",
            description: "Nous maintenons des relations avec nos clients. Contactez-nous à tout moment pour des questions, achats futurs ou recommandations.",
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
      title: "マーケット",
      totalCars: "総車両数",
      addCar: "新しい車を追加",
      noCars: "在庫に車がありません",
      noDescription: "最初の車を追加して始めましょう",
      loading: "読み込み中...",
      tabs: {
        cars: "車",
        newTires: "新品タイヤ",
        usedTires: "中古タイヤ",
        wheelDrums: "ホイールドラム",
      },
      noItems: "商品がありません",
      checkBack: "新しい商品が入荷するまでお待ちください。",
      mileage: "走行距離",
      fuel: "燃料",
      transmission: "変速機",
      contactSeller: "販売者に連絡",
      conditionNew: "新品",
      conditionUsed: "中古",
    },
    // Language
    language: {
      select: "言語",
      english: "英語",
      french: "フランス語",
      japanese: "日本語",
    },
    // Flow
    flow: {
      title: "購入フロー",
      subtitle: "日本から車両を入手するための簡単なステップ",
      international: {
        title: "海外のお客様",
        subtitle: "世界各国への輸出サービス",
        steps: [
          {
            step: "1",
            title: "お問い合わせ",
            description: "メール、電話、またはお問い合わせフォームからご連絡ください。ご希望の車両、タイヤ、部品についてお知らせください。",
          },
          {
            step: "2",
            title: "ご相談・お見積り",
            description: "お客様のニーズをお伺いし、最適なご提案をいたします。車両費用、配送オプション（20フィートまたは40フィートコンテナ）、輸出費用を含む詳細なお見積りをお送りします。",
          },
          {
            step: "3",
            title: "車両調達・検査",
            description: "日本の信頼できるオークションやディーラーからご希望の商品を調達します。徹底的な検査を行い、詳細な写真とコンディションレポートをお送りします。",
          },
          {
            step: "4",
            title: "お支払い・購入",
            description: "ご承認後、購入手続きを進めます。銀行振込でのお支払いが可能です。すべての購入手続きを代行いたします。",
          },
          {
            step: "5",
            title: "輸出書類準備",
            description: "抹消証明書、輸出通関書類、船荷証券、輸出インボイスなど、必要なすべての輸出書類を準備いたします。",
          },
          {
            step: "6",
            title: "コンテナ積込・出荷",
            description: "ご選択いただいたコンテナサイズ（20フィートまたは40フィート）に丁寧に積み込み、目的地の港へ発送します。追跡情報を随時お知らせします。",
          },
          {
            step: "7",
            title: "アフターサポート",
            description: "出荷後もサービスは続きます。目的地での通関手続きに関するご質問や、今後のご注文についてもサポートいたします。",
          },
        ],
      },
      local: {
        title: "国内のお客様（日本）",
        subtitle: "国内サービス",
        steps: [
          {
            step: "1",
            title: "お問い合わせ",
            description: "お電話、メール、または直接ヤードにお越しください。ご興味のある車両、タイヤ、部品についてお知らせください。",
          },
          {
            step: "2",
            title: "ご相談・お見積り",
            description: "ご要望をお伺いし、競争力のあるお見積りをご提供します。在庫を直接ご確認いただくため、ヤードへのご来場も歓迎いたします。",
          },
          {
            step: "3",
            title: "車両選択",
            description: "ヤードの在庫をご覧いただくか、特定の商品をリクエストしてください。ご希望に応じてオークションからの車両調達も可能です。",
          },
          {
            step: "4",
            title: "お支払い・書類手続き",
            description: "お支払い完了後、輸出準備に必要なすべての書類手続きを代行いたします。",
          },
          {
            step: "5",
            title: "引取りまたは配送",
            description: "ヤードで直接お引取りいただくか、ご相談に応じてお客様のご指定場所への配送も可能です。柔軟に対応いたします。",
          },
          {
            step: "6",
            title: "アフターサービス",
            description: "お客様との関係を大切にしています。ご質問、将来のご購入、おすすめについていつでもお問い合わせください。",
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
