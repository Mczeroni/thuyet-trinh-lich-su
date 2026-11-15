/**
 * slides-data.js
 * Dữ liệu trình chiếu Lịch sử 10 — Chương trình GDPT mới
 * Chủ đề: Các cuộc cách mạng công nghiệp thời hiện đại (Cách mạng công nghiệp lần thứ tư)
 *
 * Quy ước học thuật:
 * - "Kiến thức cốt lõi SGK": Bám sát nội dung trọng tâm SGK Lịch sử 10.
 * - "Thông tin mở rộng": Dẫn chứng bối cảnh quốc tế và ví dụ thực tiễn bổ sung.
 */
(function (root) {
  "use strict";

  const PRESENTATION_META = {
    title: "CÁCH MẠNG CÔNG NGHIỆP LẦN THỨ TƯ",
    subtitle: "INDUSTRY 4.0 — KỶ NGUYÊN CỦA CÔNG NGHỆ SỐ VÀ TRÍ TUỆ NHÂN TẠO",
    subject: "Lịch sử 10",
    topic: "Các cuộc cách mạng công nghiệp thời hiện đại",
    curriculumStandard: "SGK Lịch sử 10 (Chương trình GDPT mới)",
    presenter: "Nhóm 2",
    className: "10A10",
    totalSlides: 21,
    aspectRatio: "16:9",
    resolution: { width: 1920, height: 1080 },
    language: "vi",
    glossary: [
      { term: "AI", full: "Artificial Intelligence", vi: "Trí tuệ nhân tạo" },
      { term: "IoT", full: "Internet of Things", vi: "Internet vạn vật" },
      { term: "Big Data", full: "Big Data", vi: "Dữ liệu lớn" },
      { term: "Cloud Computing", full: "Cloud Computing", vi: "Điện toán đám mây" },
      { term: "Robotics", full: "Robotics & Automation", vi: "Người máy và tự động hóa" },
      { term: "3D Printing", full: "3D Printing", vi: "In ba chiều" }
    ],
    references: [
      {
        title: "SGK Lịch sử 10 (Chương trình GDPT mới) — Bài: Các cuộc cách mạng công nghiệp thời hiện đại",
        url: "",
        sourceType: "Tài liệu giáo khoa chuẩn"
      },
      {
        title: "Bộ Khoa học và Công nghệ Việt Nam (Bộ KH&CN)",
        url: "https://mst.gov.vn/",
        sourceType: "Cổng thông tin KH&CN quốc gia"
      },
      {
        title: "Tạp chí Công Thương — Chuyên đề Cách mạng công nghiệp 4.0",
        url: "https://tapchicongthuong.vn/",
        sourceType: "Tạp chí nghiên cứu kinh tế - công nghiệp"
      },
      {
        title: "World Economic Forum (WEF) — The Fourth Industrial Revolution",
        url: "https://www.weforum.org/",
        sourceType: "Tài liệu mở rộng quốc tế"
      }
    ]
  };

  const SLIDES_DATA = [
    // =========================================================================
    // SLIDE 01: COVER
    // =========================================================================
    {
      id: 1,
      slug: "slide-01",
      number: "01",
      layout: "cover",
      transition: "fade",
      navTitle: "Trang bìa — Công nghiệp 4.0",
      eyebrow: "LỊCH SỬ 10 • CHƯƠNG TRÌNH GDPT MỚI",
      title: "CÁCH MẠNG CÔNG NGHIỆP LẦN THỨ TƯ",
      subtitle: "INDUSTRY 4.0 — KỶ NGUYÊN CỦA CÔNG NGHỆ SỐ VÀ TRÍ TUỆ NHÂN TẠO",
      knowledgeTag: "Chuyên đề Lịch sử hiện đại",
      meta: [
        { key: "subject", label: "Môn học", value: "Lịch sử 10", editable: false },
        { key: "topic", label: "Chủ đề", value: "Các cuộc cách mạng công nghiệp thời hiện đại", editable: false },
        { key: "presenter", label: "Thực hiện", value: "Nhóm 2", editable: true, placeholder: "Nhập tên nhóm" },
        { key: "className", label: "Lớp", value: "10A10", editable: true, placeholder: "Nhập lớp" }
      ],
      ctaLabel: "START PRESENTATION",
      icon: "factory.svg",
      image: {
        src: "hero-smart-factory.jpg",
        alt: "Nhà máy thông minh tự động hóa với cánh tay robot công nghiệp hiện đại",
        caption: "Nhà máy thông minh — Biểu tượng sản xuất kỷ nguyên 4.0"
      }
    },

    // =========================================================================
    // SLIDE 02: TIMELINE — BỐN CUỘC CÁCH MẠNG CÔNG NGHIỆP
    // =========================================================================
    {
      id: 2,
      slug: "slide-02",
      number: "02",
      layout: "timeline",
      transition: "reveal",
      navTitle: "Mở đầu: Bốn cuộc cách mạng",
      eyebrow: "TIẾN TRÌNH LỊCH SỬ THẾ GIỚI",
      title: "MỞ ĐẦU: BỐN CUỘC CÁCH MẠNG CÔNG NGHIỆP",
      subtitle: "Từ cơ giới hóa hơi nước đến kỷ nguyên công nghệ số thông minh",
      knowledgeTag: "Kiến thức cốt lõi SGK",
      eras: [
        {
          version: "1.0",
          era: "Cuối TK XVIII – đầu TK XIX",
          title: "Cơ giới hóa với máy hơi nước",
          coreTech: "Máy hơi nước",
          summary: "Cơ giới hóa, thay thế lao động tay chân.",
          image: "rev1-steam.jpg",
          imageAlt: "Động cơ hơi nước trong Cách mạng công nghiệp lần thứ nhất",
          highlight: false
        },
        {
          version: "2.0",
          era: "Nửa sau TK XIX – đầu TK XX",
          title: "Điện năng và sản xuất hàng loạt",
          coreTech: "Điện năng, Dây chuyền",
          summary: "Sản xuất hàng loạt quy mô lớn.",
          image: "rev2-electric.jpg",
          imageAlt: "Dây chuyền sản xuất công nghiệp sử dụng điện năng thời kỳ 2.0",
          highlight: false
        },
        {
          version: "3.0",
          era: "Nửa sau TK XX",
          title: "Điện tử, máy tính và tự động hóa",
          coreTech: "Máy tính, Điện tử, Internet",
          summary: "Số hóa và tự động hóa quy trình.",
          image: "rev3-computer.jpg",
          imageAlt: "Máy tính điện tử và thiết bị tự động hóa thời kỳ 3.0",
          highlight: false
        },
        {
          version: "4.0",
          era: "Đầu TK XXI – nay",
          title: "Công nghệ số thông minh và kết nối dữ liệu",
          coreTech: "AI, IoT & Big Data",
          summary: "Kết nối vạn vật và thông minh hóa.",
          image: "rev4-industry40.jpg",
          imageAlt: "Mạng lưới công nghệ số thông minh của Cách mạng công nghiệp 4.0",
          highlight: true
        }
      ]
    },

    // =========================================================================
    // SLIDE 03: CONCEPT SPLIT — KHÁI NIỆM VÀ THỜI ĐIỂM RA ĐỜI
    // =========================================================================
    {
      id: 3,
      slug: "slide-03",
      number: "03",
      layout: "concept-split",
      transition: "slide-left",
      navTitle: "Khái niệm & Thời điểm ra đời",
      eyebrow: "NHẬN DIỆN KHÁI NIỆM LỊCH SỬ",
      title: "KHÁI NIỆM VÀ THỜI ĐIỂM RA ĐỜI",
      subtitle: "Khởi phát đầu thế kỉ XXI trên nền tảng kết nối dữ liệu lớn",
      coreSection: {
        badge: "Kiến thức cốt lõi SGK",
        badgeType: "sgk",
        heading: "Nội dung chuẩn SGK Lịch sử 10",
        exactQuote: "Bắt đầu từ những năm đầu thế kỉ XXI; các thiết bị kết nối thu thập dữ liệu lớn (Big Data), tạo cơ sở cho các ngành công nghệ mới.",
        points: [
          {
            label: "Thời điểm",
            text: "Từ những năm đầu thế kỉ XXI đến nay."
          },
          {
            label: "Nền tảng",
            text: "Kế thừa CNTT và tự động hóa của 3.0."
          },
          {
            label: "Đặc trưng",
            text: "Hội tụ Vật lý – Kỹ thuật số – Sinh học."
          }
        ]
      },
      expandedSection: {
        badge: "Thông tin mở rộng",
        badgeType: "expanded",
        heading: "Dấu mốc quốc tế",
        points: [
          {
            year: "2011",
            label: "Hannover Messe (Đức)",
            text: "Giới thiệu thuật ngữ \"Industry 4.0\"."
          },
          {
            year: "2016",
            label: "Diễn đàn WEF",
            text: "Phổ biến rộng rãi trên toàn cầu."
          },
          {
            year: "3.0 vs 4.0",
            label: "Phân biệt nhanh",
            text: "3.0 tự động hóa; 4.0 kết nối & tự tối ưu bằng AI."
          }
        ]
      },
      image: {
        src: "digital-world.jpg",
        alt: "Mạng lưới kết nối số toàn cầu trong kỷ nguyên Cách mạng 4.0",
        caption: "Thế giới kỹ thuật số kết nối dữ liệu thời gian thực"
      }
    },

    // =========================================================================
    // SLIDE 04: PIPELINE DIAGRAM — BẢN CHẤT CỦA CÔNG NGHIỆP 4.0
    // =========================================================================
    {
      id: 4,
      slug: "slide-04",
      number: "04",
      layout: "pipeline-diagram",
      transition: "zoom-in",
      navTitle: "Bản chất Công nghiệp 4.0",
      eyebrow: "CƠ CHẾ VẬN HÀNH THÔNG MINH",
      title: "BẢN CHẤT CỦA CÔNG NGHIỆP 4.0",
      subtitle: "Ba yếu tố cốt lõi phối hợp qua chu trình tự động hóa 5 bước",
      knowledgeTag: "Kiến thức cốt lõi SGK",
      pillars: [
        {
          code: "AI",
          vnName: "AI - Trí tuệ nhân tạo",
          icon: "ai.svg",
          role: "Phân tích dữ liệu, đưa ra quyết định."
        },
        {
          code: "IoT",
          vnName: "IoT - Internet vạn vật",
          icon: "iot.svg",
          role: "Kết nối thiết bị, cảm biến liên thông."
        },
        {
          code: "Big Data",
          vnName: "Big Data - Dữ liệu lớn",
          icon: "bigdata.svg",
          role: "Nguồn dữ liệu lớn cho công nghệ mới."
        }
      ],
      steps: [
        {
          step: 1,
          title: "Thiết bị thông minh",
          shortDesc: "Cảm biến thu nhận tín hiệu",
          techBadge: "Sensors"
        },
        {
          step: 2,
          title: "Thu thập dữ liệu",
          shortDesc: "Truyền tải dữ liệu liên tục",
          techBadge: "IoT & Big Data"
        },
        {
          step: 3,
          title: "Phân tích bằng AI",
          shortDesc: "Xử lý, nhận diện quy luật",
          techBadge: "AI"
        },
        {
          step: 4,
          title: "Đưa ra quyết định",
          shortDesc: "Chọn phương án tối ưu",
          techBadge: "Smart Control"
        },
        {
          step: 5,
          title: "Tự động hóa",
          shortDesc: "Máy móc tự động thực thi",
          techBadge: "Robotics 4.0"
        }
      ],
      replayLabel: "Chạy lại"
    },

    // =========================================================================
    // SLIDE 05: TRÍ TUỆ NHÂN TẠO (AI)
    // =========================================================================
    {
      id: 5,
      slug: "slide-05",
      number: "05",
      layout: "tech-showcase",
      transition: "parallax",
      navTitle: "Trí tuệ nhân tạo (AI)",
      eyebrow: "CÔNG NGHỆ ĐỘT PHÁ • TRỤ CỘT 01",
      title: "TRÍ TUỆ NHÂN TẠO (AI)",
      termExplanation: "AI (Artificial Intelligence) — Trí tuệ nhân tạo",
      knowledgeTag: "Kiến thức cốt lõi SGK",
      definition: "Công nghệ giúp máy tính thực hiện nhiệm vụ đòi hỏi trí thông minh của con người.",
      icon: "ai.svg",
      applications: [
        {
          title: "Trợ lý AI",
          detail: "Hỏi đáp, dịch thuật, hỗ trợ học tập."
        },
        {
          title: "Nhận diện khuôn mặt",
          detail: "Xác thực sinh trắc, bảo mật nhanh."
        },
        {
          title: "Xe tự hành",
          detail: "Nhận biết vật cản, tự điều hướng."
        },
        {
          title: "Chẩn đoán hình ảnh y tế",
          detail: "Đọc X-quang, CT, phát hiện bệnh sớm."
        },
        {
          title: "Robot thông minh",
          detail: "Hiểu ngôn ngữ, giao tiếp linh hoạt."
        }
      ],
      highlightCase: {
        badge: "Mở rộng • Ví dụ SGK",
        badgeType: "expanded",
        title: "Robot Sophia (Hanson Robotics)",
        points: [
          "2017: Robot đầu tiên được cấp quyền công dân.",
          "2018: Từng đến Việt Nam dự Diễn đàn 4.0."
        ]
      },
      image: {
        src: "ai-sophia.jpg",
        alt: "Robot hình người Sophia tích hợp trí tuệ nhân tạo của Hanson Robotics",
        caption: "Robot Sophia — biểu tượng AI và người máy"
      }
    },

    // =========================================================================
    // SLIDE 06: INTERNET VẠN VẬT (IoT)
    // =========================================================================
    {
      id: 6,
      slug: "slide-06",
      number: "06",
      layout: "iot-hub",
      transition: "slide-left",
      navTitle: "Internet vạn vật (IoT)",
      eyebrow: "CÔNG NGHỆ ĐỘT PHÁ • TRỤ CỘT 02",
      title: "INTERNET VẠN VẬT (IoT)",
      termExplanation: "IoT (Internet of Things) — Internet vạn vật",
      knowledgeTag: "Kiến thức cốt lõi SGK",
      definition: "Kết nối thiết bị qua Internet để trao đổi dữ liệu và phối hợp hoạt động.",
      icon: "iot.svg",
      applications: [
        {
          title: "Nhà thông minh",
          detail: "Điều khiển đèn, khóa, thiết bị từ xa."
        },
        {
          title: "Đồng hồ thông minh",
          detail: "Đo nhịp tim, giấc ngủ, vận động."
        },
        {
          title: "Nông nghiệp thông minh",
          detail: "Cảm biến độ ẩm, tưới tiêu tự động."
        },
        {
          title: "Thành phố thông minh",
          detail: "Điều phối giao thông, năng lượng."
        },
        {
          title: "Nhà máy kết nối",
          detail: "Giám sát dây chuyền thời gian thực."
        }
      ],
      image: {
        src: "iot-network.jpg",
        alt: "Hệ thống thiết bị thông minh và cảm biến kết nối trong mạng IoT",
        caption: "Mạng lưới thiết bị và cảm biến kết nối IoT"
      }
    },

    // =========================================================================
    // SLIDE 07: DỮ LIỆU LỚN (BIG DATA) VÀ ĐIỆN TOÁN ĐÁM MÂY
    // =========================================================================
    {
      id: 7,
      slug: "slide-07",
      number: "07",
      layout: "dual-pillar",
      transition: "scale",
      navTitle: "Big Data & Điện toán đám mây",
      eyebrow: "HẠ TẦNG DỮ LIỆU KỶ NGUYÊN SỐ",
      title: "DỮ LIỆU LỚN (BIG DATA) & ĐIỆN TOÁN ĐÁM MÂY",
      subtitle: "Hai trụ cột lưu trữ và xử lý dữ liệu trong kỷ nguyên số",
      knowledgeTag: "Kiến thức cốt lõi SGK",
      pillars: [
        {
          id: "big-data",
          title: "DỮ LIỆU LỚN",
          termExplanation: "Big Data — Dữ liệu lớn",
          icon: "bigdata.svg",
          definition: "Thu thập và xử lý dữ liệu khổng lồ để phát hiện xu hướng.",
          traits: [
            { label: "Khối lượng lớn", text: "Từ hàng tỉ thiết bị và cảm biến." },
            { label: "Tốc độ cao", text: "Xử lý nhanh theo thời gian thực." },
            { label: "Đa dạng", text: "Văn bản, ảnh, video, số liệu." },
            { label: "Giá trị", text: "Hỗ trợ AI và ra quyết định." }
          ],
          image: {
            src: "big-data.jpg",
            alt: "Trung tâm xử lý dữ liệu lớn với hệ thống máy chủ tốc độ cao",
            caption: "Hệ thống lưu trữ và phân tích Dữ liệu lớn"
          }
        },
        {
          id: "cloud-computing",
          title: "ĐIỆN TOÁN ĐÁM MÂY",
          termExplanation: "Cloud Computing — Điện toán đám mây",
          icon: "cloud.svg",
          definition: "Lưu trữ và truy cập dữ liệu qua máy chủ kết nối Internet.",
          traits: [
            { label: "Mọi lúc mọi nơi", text: "Truy cập từ nhiều thiết bị." },
            { label: "Linh hoạt", text: "Mở rộng dung lượng tức thì." },
            { label: "Tiết kiệm", text: "Giảm chi phí đầu tư hạ tầng." },
            { label: "Đồng bộ", text: "Làm việc từ xa, sao lưu an toàn." }
          ],
          image: {
            src: "cloud-computing.jpg",
            alt: "Hạ tầng máy chủ và mạng kết nối của điện toán đám mây",
            caption: "Hạ tầng máy chủ Điện toán đám mây"
          }
        }
      ]
    },

    // =========================================================================
    // SLIDE 08: ROBOTICS VÀ TỰ ĐỘNG HÓA
    // =========================================================================
    {
      id: 8,
      slug: "slide-08",
      number: "08",
      layout: "robotics-feature",
      transition: "slide-right",
      navTitle: "Robotics và Tự động hóa",
      eyebrow: "TỰ ĐỘNG HÓA THÔNG MINH TRONG SẢN XUẤT",
      title: "ROBOTICS VÀ TỰ ĐỘNG HÓA",
      termExplanation: "Robotics — Người máy và tự động hóa",
      knowledgeTag: "Kiến thức cốt lõi SGK",
      overview: "Robot kết hợp cảm biến và AI giúp tự động hóa chính xác các dây chuyền sản xuất.",
      icon: "robot.svg",
      types: [
        {
          name: "Robot công nghiệp",
          desc: "Hàn, sơn, lắp ráp tốc độ cao."
        },
        {
          name: "Cánh tay robot",
          desc: "Thao tác đa trục chính xác, ít lỗi."
        },
        {
          name: "Robot cộng tác",
          desc: "Làm việc an toàn cùng kỹ sư."
        },
        {
          name: "Robot hỗ trợ y tế",
          desc: "Hỗ trợ phẫu thuật, chăm sóc bệnh nhân."
        },
        {
          name: "Hệ thống sản xuất tự động",
          desc: "Vận hành dây chuyền liên tục 24/7."
        }
      ],
      deploymentNote: "Robot kết nối phần mềm điều hành để tự đổi thao tác theo từng mẫu sản phẩm.",
      image: {
        src: "robotics-arm.jpg",
        alt: "Cánh tay robot công nghiệp tự động lắp ráp trong dây chuyền nhà máy hiện đại",
        caption: "Robot công nghiệp trên dây chuyền ô tô tự động"
      }
    },

    // =========================================================================
    // SLIDE 09: CÔNG NGHỆ IN 3D
    // =========================================================================
    {
      id: 9,
      slug: "slide-09",
      number: "09",
      layout: "additive-process",
      transition: "reveal",
      navTitle: "Công nghệ In 3D",
      eyebrow: "CHẾ TẠO CỘNG HỢP KỸ THUẬT SỐ",
      title: "CÔNG NGHỆ IN 3D",
      termExplanation: "3D Printing — Công nghệ in ba chiều",
      knowledgeTag: "Kiến thức cốt lõi SGK",
      definition: "Tạo vật thể ba chiều từ mô hình thiết kế số bằng cách thêm vật liệu từng lớp.",
      icon: "print3d.svg",
      processSteps: [
        "1. Thiết kế mô hình 3D",
        "2. Cắt lớp kỹ thuật số",
        "3. Bồi đắp từng lớp",
        "4. Hoàn thiện sản phẩm"
      ],
      applications: [
        {
          title: "In linh kiện máy móc",
          detail: "Chế tạo chi tiết phức tạp, nhẹ."
        },
        {
          title: "Mô hình kiến trúc",
          detail: "Dựng sa bàn, công trình nhanh."
        },
        {
          title: "Bộ phận y tế",
          detail: "In khớp nhân tạo, răng, nẹp."
        },
        {
          title: "Nguyên mẫu sản phẩm",
          detail: "Thử nghiệm nhanh, giảm phế liệu."
        }
      ],
      image: {
        src: "3d-printing.jpg",
        alt: "Máy in 3D đang đắp từng lớp vật liệu tạo hình chi tiết kỹ thuật",
        caption: "Máy in 3D tạo hình sản phẩm theo từng lớp"
      }
    },

    // =========================================================================
    // SLIDE 10: CÔNG NGHỆ SINH HỌC, NANO VÀ VẬT LIỆU MỚI
    // =========================================================================
    {
      id: 10,
      slug: "slide-10",
      number: "10",
      layout: "tri-science",
      transition: "blur",
      navTitle: "Sinh học, Nano & Vật liệu mới",
      eyebrow: "HỘI TỤ VẬT LÝ – SINH HỌC – KỸ THUẬT SỐ",
      title: "CÔNG NGHỆ SINH HỌC, NANO VÀ VẬT LIỆU MỚI",
      subtitle: "Ba mũi nhọn khoa học đột phá trong y học, điện tử và công nghiệp",
      knowledgeTag: "Kiến thức cốt lõi SGK",
      pillars: [
        {
          id: "biotech",
          title: "Công nghệ Sinh học",
          icon: "biotech.svg",
          points: [
            "Công nghệ gen & chỉnh sửa ADN.",
            "Nghiên cứu y học, vắc-xin mới.",
            "Nông nghiệp công nghệ cao."
          ],
          image: {
            src: "biotech-dna.jpg",
            alt: "Nghiên cứu cấu trúc ADN trong phòng thí nghiệm công nghệ sinh học",
            caption: "Cấu trúc ADN & sinh học"
          }
        },
        {
          id: "nanotech",
          title: "Công nghệ Nano",
          icon: "nano.svg",
          points: [
            "Vật liệu kích thước nanômét.",
            "Chip điện tử, cảm biến siêu nhỏ.",
            "Ứng dụng y học & xử lý môi trường."
          ],
          image: {
            src: "nanotech.jpg",
            alt: "Vi mạch và cấu trúc công nghệ ở kích thước nanômét",
            caption: "Cấu trúc Nano & vi mạch"
          }
        },
        {
          id: "new-materials",
          title: "Vật liệu mới",
          icon: "materials.svg",
          points: [
            "Vật liệu nhẹ và siêu bền.",
            "Vật liệu thông minh tự phục hồi.",
            "Ứng dụng hàng không, xe điện."
          ],
          image: {
            src: "new-materials.jpg",
            alt: "Vật liệu sợi carbon và composite tiên tiến ứng dụng trong công nghiệp cao",
            caption: "Vật liệu sợi carbon tiên tiến"
          }
        }
      ]
    },

    // =========================================================================
    // SLIDE 11: NHÀ MÁY THÔNG MINH (INTERACTIVE SMART FACTORY MAP)
    // =========================================================================
    {
      id: 11,
      slug: "slide-11",
      number: "11",
      layout: "smart-factory-map",
      transition: "zoom-out",
      navTitle: "Nhà máy thông minh",
      eyebrow: "SƠ ĐỒ TƯƠNG TÁC • NHẤN ĐIỂM 1–6",
      title: "NHÀ MÁY THÔNG MINH (SMART FACTORY)",
      subtitle: "6 mắt xích tích hợp công nghệ 4.0 trong sản xuất (nhấn điểm 1–6)",
      knowledgeTag: "Kiến thức cốt lõi SGK",
      icon: "factory.svg",
      image: {
        src: "smart-factory.jpg",
        alt: "Toàn cảnh dây chuyền nhà máy thông minh kết nối tự động hóa",
        caption: "Mô hình Nhà máy thông minh — 6 mắt xích vận hành đồng bộ"
      },
      hotspots: [
        {
          id: "sensors",
          x: 16,
          y: 66,
          stepNum: 1,
          title: "Cảm biến thu thập dữ liệu",
          techBadge: "Sensors",
          description: "Đo nhiệt độ, áp suất, trạng thái máy tức thời."
        },
        {
          id: "iot",
          x: 33,
          y: 41,
          stepNum: 2,
          title: "IoT kết nối máy móc",
          techBadge: "IoT",
          description: "Liên thông máy móc và băng chuyền qua mạng."
        },
        {
          id: "bigdata",
          x: 50,
          y: 23,
          stepNum: 3,
          title: "Big Data lưu trữ dữ liệu",
          techBadge: "Big Data & Cloud",
          description: "Lưu trữ đồng bộ dữ liệu toàn nhà máy."
        },
        {
          id: "ai",
          x: 68,
          y: 35,
          stepNum: 4,
          title: "AI phân tích và tối ưu",
          techBadge: "AI",
          description: "Dự báo lỗi sớm, tối ưu lịch sản xuất."
        },
        {
          id: "robots",
          x: 57,
          y: 71,
          stepNum: 5,
          title: "Robot thực hiện sản xuất",
          techBadge: "Robotics",
          description: "Tự động lắp ráp, kiểm định và vận chuyển."
        },
        {
          id: "human",
          x: 84,
          y: 53,
          stepNum: 6,
          title: "Con người giám sát hệ thống",
          techBadge: "Con người",
          description: "Kỹ sư giám sát an toàn và ra quyết định."
        }
      ]
    },

    // =========================================================================
    // SLIDE 12: TÁC ĐỘNG TÍCH CỰC
    // =========================================================================
    {
      id: 12,
      slug: "slide-12",
      number: "12",
      layout: "quad-grid-positive",
      transition: "slide-left",
      navTitle: "Tác động tích cực",
      eyebrow: "ĐỘNG LỰC PHÁT TRIỂN TOÀN CẦU",
      title: "TÁC ĐỘNG TÍCH CỰC CỦA CÁCH MẠNG 4.0",
      subtitle: "Chuyển biến tích cực trên bốn lĩnh vực trọng yếu",
      knowledgeTag: "Kiến thức cốt lõi SGK",
      sectors: [
        {
          area: "KINH TẾ",
          accent: "positive",
          badge: "Năng suất & Tri thức",
          points: [
            "Tăng năng suất lao động",
            "Giảm thời gian và chi phí sản xuất",
            "Xuất hiện ngành nghề mới",
            "Phát triển thương mại điện tử"
          ],
          image: {
            src: "smart-factory.jpg",
            alt: "Nhà máy thông minh thúc đẩy năng suất kinh tế"
          }
        },
        {
          area: "XÃ HỘI",
          accent: "positive",
          badge: "Chất lượng sống",
          points: [
            "Nâng cao chất lượng cuộc sống",
            "Hỗ trợ y tế và giáo dục",
            "Tạo điều kiện làm việc từ xa"
          ],
          image: {
            src: "iot-network.jpg",
            alt: "Thiết bị thông minh nâng cao tiện ích đời sống xã hội"
          }
        },
        {
          area: "VĂN HÓA",
          accent: "positive",
          badge: "Giao lưu & Tri thức",
          points: [
            "Tăng cường giao lưu văn hóa",
            "Mở rộng cơ hội tiếp cận tri thức",
            "Chia sẻ thông tin nhanh chóng"
          ],
          image: {
            src: "digital-world.jpg",
            alt: "Kết nối văn hóa và tri thức toàn cầu trên không gian mạng"
          }
        },
        {
          area: "MÔI TRƯỜNG",
          accent: "positive",
          badge: "Phát triển xanh",
          points: [
            "Tối ưu hóa tài nguyên",
            "Phát triển công nghệ xanh",
            "Hỗ trợ quản lý năng lượng"
          ],
          image: {
            src: "renewable-energy.jpg",
            alt: "Điện mặt trời và điện gió phát triển năng lượng sạch"
          }
        }
      ]
    },

    // =========================================================================
    // SLIDE 13: NHỮNG THÁCH THỨC VÀ TÁC ĐỘNG TIÊU CỰC
    // =========================================================================
    {
      id: 13,
      slug: "slide-13",
      number: "13",
      layout: "quad-grid-negative",
      transition: "blur",
      navTitle: "Thách thức & Tác động tiêu cực",
      eyebrow: "MẶT TRÁI CẦN KIỂM SOÁT",
      title: "NHỮNG THÁCH THỨC VÀ TÁC ĐỘNG TIÊU CỰC",
      subtitle: "Những rủi ro cần kiểm soát và thích ứng",
      knowledgeTag: "Kiến thức cốt lõi SGK",
      sectors: [
        {
          area: "KINH TẾ",
          accent: "negative",
          badge: "Phân hóa & Cạnh tranh",
          points: [
            "Một số công việc truyền thống có nguy cơ bị thay thế bởi tự động hóa",
            "Người lao động phải nâng cao kỹ năng"
          ],
          image: {
            src: "big-data.jpg",
            alt: "Chênh lệch hạ tầng dữ liệu và công nghệ giữa các nền kinh tế"
          }
        },
        {
          area: "XÃ HỘI",
          accent: "negative",
          badge: "Việc làm & An ninh mạng",
          points: [
            "Nguy cơ gia tăng khoảng cách giàu nghèo",
            "Rủi ro đánh cắp dữ liệu và mất an toàn thông tin"
          ],
          image: {
            src: "cyber-security.jpg",
            alt: "Nguy cơ mất an toàn thông tin và an ninh mạng"
          }
        },
        {
          area: "VĂN HÓA",
          accent: "negative",
          badge: "Bản sắc & Thông tin",
          points: [
            "Thông tin sai lệch lan truyền nhanh",
            "Nguy cơ ảnh hưởng đến bản sắc văn hóa"
          ],
          image: {
            src: "digital-world.jpg",
            alt: "Thách thức giữ gìn bản sắc văn hóa trong không gian số"
          }
        },
        {
          area: "MÔI TRƯỜNG",
          accent: "negative",
          badge: "Rác thải & Năng lượng",
          points: [
            "Rác thải điện tử",
            "Tiêu thụ năng lượng của hệ thống công nghệ"
          ],
          image: {
            src: "challenge-ewaste.jpg",
            alt: "Rác thải điện tử từ thiết bị công nghệ gây áp lực môi trường"
          }
        }
      ]
    },

    // =========================================================================
    // SLIDE 14: CÁCH MẠNG CÔNG NGHIỆP 4.0 Ở VIỆT NAM
    // =========================================================================
    {
      id: 14,
      slug: "slide-14",
      number: "14",
      layout: "vietnam-focus",
      transition: "parallax",
      navTitle: "Công nghiệp 4.0 ở Việt Nam",
      eyebrow: "THỰC TIỄN CHUYỂN ĐỔI SỐ QUỐC GIA",
      title: "CÁCH MẠNG CÔNG NGHIỆP 4.0 Ở VIỆT NAM",
      subtitle: "Ứng dụng thực tiễn để nắm bắt cơ hội và vượt qua thách thức",
      knowledgeTag: "Kiến thức cốt lõi SGK & Thực tiễn",
      icon: "vietnam.svg",
      applications: [
        {
          title: "Chuyển đổi số doanh nghiệp",
          detail: "Số hóa quản trị, dịch vụ công."
        },
        {
          title: "AI & tự động hóa sản xuất",
          detail: "Đưa robot, AI vào nhà máy."
        },
        {
          title: "Nông nghiệp công nghệ cao",
          detail: "Cảm biến IoT, drone canh tác."
        },
        {
          title: "Thương mại điện tử",
          detail: "Bán lẻ số, thanh toán online."
        },
        {
          title: "Y tế & giáo dục trực tuyến",
          detail: "Khám bệnh, học tập qua mạng."
        },
        {
          title: "Năng lượng tái tạo",
          detail: "Phát triển điện mặt trời, gió."
        }
      ],
      opportunities: {
        heading: "Cơ hội",
        points: [
          "Đẩy nhanh công nghiệp hóa, hiện đại hóa.",
          "Phát triển kinh tế tri thức và kinh tế số."
        ]
      },
      challenges: {
        heading: "Thách thức",
        points: [
          { label: "Nhân lực", text: "Chất lượng nguồn nhân lực." },
          { label: "Hạ tầng", text: "Hạ tầng công nghệ số." },
          { label: "An ninh mạng", text: "Bảo mật và an toàn dữ liệu." },
          { label: "Thích nghi", text: "Khả năng thích ứng của lao động." }
        ]
      },
      images: [
        {
          src: "vietnam-tech.jpg",
          alt: "Đô thị hiện đại và phát triển công nghệ số tại Việt Nam",
          caption: "Đô thị số & công nghệ Việt Nam"
        },
        {
          src: "smart-agriculture.jpg",
          alt: "Nông nghiệp công nghệ cao ứng dụng cảm biến và tự động hóa",
          caption: "Nông nghiệp công nghệ cao"
        },
        {
          src: "renewable-energy.jpg",
          alt: "Điện mặt trời và điện gió phục vụ chuyển dịch năng lượng xanh",
          caption: "Năng lượng tái tạo"
        }
      ]
    },

    // =========================================================================
    // SLIDE 15: SO SÁNH BỐN CUỘC CÁCH MẠNG CÔNG NGHIỆP
    // =========================================================================
    {
      id: 15,
      slug: "slide-15",
      number: "15",
      layout: "comparison-matrix",
      transition: "scale",
      navTitle: "So sánh bốn cuộc cách mạng",
      eyebrow: "TỔNG HỢP ĐỐI CHIẾU LỊCH SỬ",
      title: "SO SÁNH BỐN CUỘC CÁCH MẠNG CÔNG NGHIỆP",
      subtitle: "Đối chiếu nhanh các giai đoạn 1.0 – 4.0 (nhấn hàng để làm nổi bật)",
      knowledgeTag: "Kiến thức cốt lõi SGK",
      columns: [
        "Lần",
        "Thời gian",
        "Công nghệ đại diện",
        "Đặc trưng",
        "Ý nghĩa"
      ],
      rows: [
        {
          version: "1.0",
          name: "1.0",
          period: "Cuối TK XVIII",
          tech: "Máy hơi nước",
          coreFeature: "Cơ giới hóa",
          impact: "Thay thế lao động thủ công bằng máy móc.",
          image: "rev1-steam.jpg",
          imageAlt: "Máy hơi nước thời kỳ Cách mạng 1.0",
          isHighlight: false
        },
        {
          version: "2.0",
          name: "2.0",
          period: "Cuối TK XIX",
          tech: "Điện năng",
          coreFeature: "Sản xuất hàng loạt",
          impact: "Dây chuyền lắp ráp công nghiệp quy mô lớn.",
          image: "rev2-electric.jpg",
          imageAlt: "Sản xuất điện khí hóa thời kỳ Cách mạng 2.0",
          isHighlight: false
        },
        {
          version: "3.0",
          name: "3.0",
          period: "Nửa sau TK XX",
          tech: "Máy tính, điện tử",
          coreFeature: "Tự động hóa",
          impact: "Khởi đầu kỷ nguyên thông tin & CNTT.",
          image: "rev3-computer.jpg",
          imageAlt: "Máy tính và hệ thống điện tử thời kỳ Cách mạng 3.0",
          isHighlight: false
        },
        {
          version: "4.0",
          name: "4.0",
          period: "Đầu TK XXI",
          tech: "AI, IoT, Big Data",
          coreFeature: "Kết nối và thông minh hóa",
          impact: "Hội tụ Vật lý – Số – Sinh học toàn cầu.",
          image: "rev4-industry40.jpg",
          imageAlt: "Công nghệ số thông minh thời kỳ Cách mạng 4.0",
          isHighlight: true
        }
      ]
    },

    // =========================================================================
    // SLIDE 16: TỔNG KẾT VÀ Ý NGHĨA LỊCH SỬ
    // =========================================================================
    {
      id: 16,
      slug: "slide-16",
      number: "16",
      layout: "closing-statement",
      transition: "zoom-in",
      navTitle: "Tổng kết & Ý nghĩa lịch sử",
      eyebrow: "ĐÚC KẾT CHUYÊN ĐỀ LỊCH SỬ 10",
      title: "TỔNG KẾT VÀ Ý NGHĨA LỊCH SỬ",
      knowledgeTag: "Kiến thức cốt lõi SGK",
      takeaways: [
        {
          num: "01",
          title: "Thời điểm khởi phát",
          text: "Công nghiệp 4.0 bắt đầu từ những năm đầu thế kỉ XXI."
        },
        {
          num: "02",
          title: "Đột phá công nghệ số",
          text: "Là sự phát triển mạnh mẽ của công nghệ số và các công nghệ thông minh."
        },
        {
          num: "03",
          title: "Tác động toàn diện",
          text: "Tác động sâu rộng tới kinh tế, xã hội và đời sống con người."
        },
        {
          num: "04",
          title: "Cơ hội và thách thức",
          text: "Tạo ra nhiều cơ hội nhưng cũng đặt ra không ít thách thức."
        }
      ],
      closingQuote: "CÔNG NGHỆ CÓ THỂ THAY ĐỔI THẾ GIỚI, NHƯNG CON NGƯỜI SẼ QUYẾT ĐỊNH CÁCH THẾ GIỚI ĐƯỢC THAY ĐỔI.",
      quoteNote: "Thông điệp kết thúc chuyên đề Cách mạng công nghiệp lần thứ tư"
    },

    // =========================================================================
    // SLIDE 17: CÂU HỎI TƯƠNG TÁC — CÂU 1
    // =========================================================================
    {
      id: 17,
      slug: "slide-17",
      number: "17",
      layout: "quiz-single",
      transition: "fade",
      navTitle: "Câu hỏi 1 — Thời điểm khởi phát",
      eyebrow: "KIỂM TRA NHANH • CÂU 1 / 4",
      title: "CÂU HỎI TƯƠNG TÁC — CÂU 1",
      icon: "quiz.svg",
      quiz: {
        scoreLabel: "Điểm",
        resetLabel: "Làm lại",
        questionIndex: 0,
        totalQuestions: 4,
        nextLabel: "Câu tiếp theo →",
        question: {
          id: "q1",
          question: "Cách mạng công nghiệp lần thứ tư bắt đầu từ thời gian nào?",
          options: [
            "A. Thế kỉ XVIII.",
            "B. Đầu thế kỉ XX.",
            "C. Đầu thế kỉ XXI.",
            "D. Cuối thế kỉ XIX."
          ],
          correctIndex: 2,
          explanation: "Đúng (C): Công nghiệp 4.0 bắt đầu từ đầu thế kỉ XXI."
        }
      }
    },

    // =========================================================================
    // SLIDE 18: CÂU HỎI TƯƠNG TÁC — CÂU 2
    // =========================================================================
    {
      id: 18,
      slug: "slide-18",
      number: "18",
      layout: "quiz-single",
      transition: "slide-left",
      navTitle: "Câu hỏi 2 — Công nghệ cốt lõi",
      eyebrow: "KIỂM TRA NHANH • CÂU 2 / 4",
      title: "CÂU HỎI TƯƠNG TÁC — CÂU 2",
      icon: "quiz.svg",
      quiz: {
        scoreLabel: "Điểm",
        resetLabel: "Làm lại",
        questionIndex: 1,
        totalQuestions: 4,
        nextLabel: "Câu tiếp theo →",
        question: {
          id: "q2",
          question: "Ba yếu tố công nghệ cốt lõi thường được nhấn mạnh trong Công nghiệp 4.0 là gì?",
          options: [
            "A. Hơi nước, điện năng, dầu mỏ.",
            "B. AI, IoT và Big Data.",
            "C. Máy hơi nước, động cơ điện, máy tính.",
            "D. Than đá, dầu mỏ, điện."
          ],
          correctIndex: 1,
          explanation: "Đúng (B): Ba trụ cột cốt lõi là AI, IoT và Big Data."
        }
      }
    },

    // =========================================================================
    // SLIDE 19: CÂU HỎI TƯƠNG TÁC — CÂU 3
    // =========================================================================
    {
      id: 19,
      slug: "slide-19",
      number: "19",
      layout: "quiz-single",
      transition: "slide-left",
      navTitle: "Câu hỏi 3 — Công nghệ In 3D",
      eyebrow: "KIỂM TRA NHANH • CÂU 3 / 4",
      title: "CÂU HỎI TƯƠNG TÁC — CÂU 3",
      icon: "quiz.svg",
      quiz: {
        scoreLabel: "Điểm",
        resetLabel: "Làm lại",
        questionIndex: 2,
        totalQuestions: 4,
        nextLabel: "Câu tiếp theo →",
        question: {
          id: "q3",
          question: "Công nghệ nào cho phép tạo vật thể theo từng lớp từ mô hình số?",
          options: [
            "A. IoT.",
            "B. Big Data.",
            "C. In 3D.",
            "D. Điện toán đám mây."
          ],
          correctIndex: 2,
          explanation: "Đúng (C): In 3D đắp bồi từng lớp từ bản thiết kế số."
        }
      }
    },

    // =========================================================================
    // SLIDE 20: CÂU HỎI TƯƠNG TÁC — CÂU 4
    // =========================================================================
    {
      id: 20,
      slug: "slide-20",
      number: "20",
      layout: "quiz-single",
      transition: "slide-left",
      navTitle: "Câu hỏi 4 — Thách thức 4.0",
      eyebrow: "KIỂM TRA NHANH • CÂU 4 / 4",
      title: "CÂU HỎI TƯƠNG TÁC — CÂU 4",
      icon: "quiz.svg",
      quiz: {
        scoreLabel: "Điểm",
        resetLabel: "Làm lại",
        questionIndex: 3,
        totalQuestions: 4,
        nextLabel: "Lời cảm ơn →",
        question: {
          id: "q4",
          question: "Đâu là một thách thức của Cách mạng công nghiệp 4.0?",
          options: [
            "A. Nâng cao năng suất.",
            "B. Mở rộng giao lưu văn hóa.",
            "C. Nguy cơ thay thế một số công việc và mất an toàn dữ liệu.",
            "D. Tăng khả năng kết nối."
          ],
          correctIndex: 2,
          explanation: "Đúng (C): Tự động hóa dễ thay thế việc làm và gây rủi ro dữ liệu."
        }
      }
    },

    // =========================================================================
    // SLIDE 21: LỜI CẢM ƠN
    // =========================================================================
    {
      id: 21,
      slug: "slide-21",
      number: "21",
      layout: "thank-you",
      transition: "fade",
      navTitle: "Lời cảm ơn — Kết thúc",
      eyebrow: "LỊCH SỬ 10 • KẾT THÚC BÀI THUYẾT TRÌNH",
      title: "XIN CẢM ƠN THẦY CÔ VÀ CÁC BẠN ĐÃ LẮNG NGHE!",
      headlinePrefix: "XIN CẢM ƠN THẦY CÔ VÀ",
      highlightText: "CÁC BẠN ĐÃ LẮNG NGHE!",
      subtitle: "Rất mong nhận được những ý kiến nhận xét và trao đổi từ thầy cô và các bạn.",
      image: {
        src: "digital-world.jpg",
        alt: "Trái Đất kết nối toàn cầu trong kỷ nguyên Cách mạng công nghiệp 4.0",
        caption: "Kết nối tri thức kỷ nguyên số"
      },
      credits: [
        { key: "presenter", label: "Thực hiện", value: "Nhóm 2", editable: true },
        { key: "className", label: "Lớp", value: "10A10", editable: true },
        { key: "subject", label: "Môn học", value: "Lịch sử 10", editable: false }
      ],
      restartLabel: "Trình chiếu lại từ đầu",
      quizReviewLabel: "Xem lại câu hỏi"
    }
  ];

  root.PRESENTATION_META = PRESENTATION_META;
  root.SLIDES_DATA = SLIDES_DATA;

  if (typeof module !== "undefined" && module.exports) {
    module.exports = { PRESENTATION_META, SLIDES_DATA };
  }
})(typeof window !== "undefined" ? window : globalThis);
