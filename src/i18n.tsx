import React from "react";

export type Language = "vi" | "en";

const translations = {
  vi: {
    pageTitle: "Belleza Lab - Khai phá Nghệ thuật",
    pageDescription: "Đồng hành cùng AI và Belleza Lab để khám phá nghệ thuật, phân tích tác phẩm và chọn bảng màu phù hợp.",
    loadingSession: "Đang kiểm tra phiên đăng nhập...",
    signOutFailure: "Không thể đăng xuất. Vui lòng thử lại.",
    connectionFailure: "Không thể kết nối dịch vụ đăng nhập.",
    workspaceTitle: "Khai phá Nghệ thuật",
    currentSketchTab: "Bản vẽ",
    currentTab: "Hiện tại",
    optimizedTab: "Tối ưu",
    belleTab: "Belle",
    signOut: "Đăng xuất",
    closePanel: "Đóng cửa sổ",
    openAnalysis: "Mở Phân Tích",
    switchToEnglish: "Chuyển sang tiếng Anh",
    switchToVietnamese: "Chuyển sang tiếng Việt",
    toggleTheme: "Đổi giao diện sáng/tối",
    authCreateTitle: "Tạo không gian của bạn",
    authWelcomeBack: "Chào mừng trở lại",
    authDescription: "Đăng nhập để khám phá bảng màu và trò chuyện cùng Belle.",
    authStoryTitle: "Mỗi sắc màu mở ra một câu chuyện mới.",
    authMoodboardLabel: "NGHIÊN CỨU MÀU SẮC",
    authMoodboardCaption: "Tìm bảng màu của riêng bạn.",
    email: "Email",
    password: "Mật khẩu",
    displayName: "Tên hiển thị",
    confirmPassword: "Xác nhận mật khẩu",
    passwordMismatch: "Mật khẩu xác nhận không khớp.",
    showPassword: "Hiện mật khẩu",
    hidePassword: "Ẩn mật khẩu",
    passwordHint: "Tối thiểu 8 ký tự",
    processing: "Đang xử lý...",
    createAccount: "Tạo tài khoản",
    login: "Đăng nhập",
    hasAccount: "Đã có tài khoản?",
    noAccount: "Chưa có tài khoản?",
    authFailure: "Không thể đăng nhập. Vui lòng thử lại.",
    authConnectionFailure: "Không thể kết nối dịch vụ đăng nhập. Vui lòng thử lại sau.",
    studioEyebrow: "KHÔNG GIAN SÁNG TẠO CÙNG BELLE",
    studioDescription: "Khám phá sắc màu và tìm cảm hứng mới cho tác phẩm của bạn.",
    sketchMode: "Chế độ phác thảo",
    sketchModeHelp: "Gợi ý màu sắc và cách phối màu",
    enableSketchMode: "Bật chế độ phác thảo",
    enabled: "Đang bật",
    disabled: "Tắt",
    style: "Phong cách",
    gentleStyle: "Nhẹ nhàng (Pastel)",
    cheerfulStyle: "Vui tươi",
    moodyStyle: "U buồn",
    classicStyle: "Cổ điển",
    modernStyle: "Hiện đại",
    material: "Chất liệu",
    uploadArtwork: "Chọn hoặc thả ảnh tác phẩm để bắt đầu phân tích",
    dropArtwork: "Thả tác phẩm của bạn tại đây",
    startArtwork: "Bắt đầu với một tác phẩm",
    dragUpload: "Kéo thả ảnh vào đây hoặc nhấn để chọn từ thiết bị",
    autoOptimize: "Ảnh được tự động tối ưu",
    or: "Hoặc",
    takePhoto: "Chụp ảnh",
    uploadedArtwork: "Tác phẩm đã tải lên",
    analyzeAnother: "Phân tích tác phẩm khác",
    chooseImage: "Hãy chọn một file ảnh.",
    analysisFailure: "Phân tích thất bại. Vui lòng thử lại.",
    imageProcessingFailure: "Không thể xử lý ảnh.",
    loaderText: "Belleza Lab đang cảm thụ bức tranh",
    suggestedMedium: "Chất liệu đề xuất",
    predictedMedium: "Chất liệu dự đoán",
    placementGuide: "Hướng dẫn tô màu",
    suggestedPalette: "Bảng màu đề xuất",
    currentPalette: "Bảng màu hiện tại",
    belleAdvice: "Lời khuyên từ Belle",
    suggestedReplacements: "Thay thế đề xuất",
    perfectPalette: "Bảng màu Hoàn mỹ",
    formula: "Công thức",
    formulaFor: "Công thức:",
    artistMuse: "Nàng thơ Nghệ thuật",
    chatGreeting: "Chào Tuấn! Mình là Belle, nàng thơ ảo của Belleza Lab. Có điều gì bạn muốn khám phá thêm không?",
    finalReview: "Yêu cầu Nhận xét Cuối cùng",
    chatPlaceholder: "Hỏi Belle về hướng vẽ tiếp theo...",
    chatFailure: "Xin lỗi, Belle đang gặp sự cố. Bạn thử lại sau nhé!",
    sketchGreeting: "Chào bạn! Bức phác thảo này gợi cảm giác {mood}. Belle đã chọn bảng màu phong cách {style}. Bạn thấy sao?",
    finalReviewMessage: "Tôi đã hoàn thành bức tranh này. Hãy cho tôi nhận xét cuối cùng nhé.",
    finalReviewPrompt: "Bức tranh này đã hoàn thành. Với tư cách là Belle từ Belleza Lab, hãy đưa ra một lời nhận xét chuyên sâu, cấu trúc: Emotional Impact, Technical Skill, Overall Harmony, Exhibition Suggestion.",
    tapForFormula: "Nhấn để xem công thức",
    downloading: "Đang tải...",
    downloadPalette: "Tải Thẻ Màu",
    analyzedBy: "Phân tích bởi Belle · Trí tuệ Nghệ thuật",
  },
  en: {
    pageTitle: "Belleza Lab - AI Art & Color Studio",
    pageDescription: "Explore artwork, discover color harmony, and create inspiring palettes with Belleza Lab and Belle.",
    loadingSession: "Checking your session...",
    signOutFailure: "Could not sign out. Please try again.",
    connectionFailure: "Could not connect to the authentication service.",
    workspaceTitle: "Explore Art",
    currentSketchTab: "Sketch",
    currentTab: "Current",
    optimizedTab: "Refined",
    belleTab: "Belle",
    signOut: "Sign out",
    closePanel: "Close panel",
    openAnalysis: "Open analysis",
    switchToEnglish: "Switch to English",
    switchToVietnamese: "Switch to Vietnamese",
    toggleTheme: "Toggle light or dark theme",
    authCreateTitle: "Create your studio space",
    authWelcomeBack: "Welcome back",
    authDescription: "Sign in to explore color palettes and chat with Belle.",
    authStoryTitle: "Every color opens a new story.",
    authMoodboardLabel: "COLOR STUDY",
    authMoodboardCaption: "A quieter way to find your palette.",
    email: "Email",
    password: "Password",
    displayName: "Display name",
    confirmPassword: "Confirm password",
    passwordMismatch: "Passwords do not match.",
    showPassword: "Show password",
    hidePassword: "Hide password",
    passwordHint: "At least 8 characters",
    processing: "Working...",
    createAccount: "Create account",
    login: "Sign in",
    hasAccount: "Already have an account?",
    noAccount: "Don't have an account?",
    authFailure: "Could not sign in. Please try again.",
    authConnectionFailure: "Could not connect to the authentication service. Please try again.",
    studioEyebrow: "YOUR CREATIVE SPACE WITH BELLE",
    studioDescription: "Explore color and find fresh inspiration for your artwork.",
    sketchMode: "Sketch mode",
    sketchModeHelp: "Get color and palette suggestions",
    enableSketchMode: "Enable sketch mode",
    enabled: "On",
    disabled: "Off",
    style: "Style",
    gentleStyle: "Gentle (Pastel)",
    cheerfulStyle: "Cheerful",
    moodyStyle: "Moody",
    classicStyle: "Classic",
    modernStyle: "Modern",
    material: "Medium",
    uploadArtwork: "Choose or drop artwork to start an analysis",
    dropArtwork: "Drop your artwork here",
    startArtwork: "Start with a piece of art",
    dragUpload: "Drag an image here or click to browse your device",
    autoOptimize: "Images are optimized automatically",
    or: "Or",
    takePhoto: "Take a photo",
    uploadedArtwork: "Uploaded artwork",
    analyzeAnother: "Analyze another artwork",
    chooseImage: "Please choose an image file.",
    analysisFailure: "Analysis failed. Please try again.",
    imageProcessingFailure: "Could not process the image.",
    loaderText: "Belleza Lab is studying your artwork",
    suggestedMedium: "Suggested medium",
    predictedMedium: "Predicted medium",
    placementGuide: "Color placement guide",
    suggestedPalette: "Suggested palette",
    currentPalette: "Current palette",
    belleAdvice: "Belle's advice",
    suggestedReplacements: "Suggested replacements",
    perfectPalette: "The perfect palette",
    formula: "Mixing guide",
    formulaFor: "Mixing guide for",
    artistMuse: "Your artistic muse",
    chatGreeting: "Hello! I'm Belle, Belleza Lab's virtual muse. What would you like to explore?",
    finalReview: "Get a final critique",
    chatPlaceholder: "Ask Belle how to develop your artwork...",
    chatFailure: "Sorry, Belle ran into a problem. Please try again.",
    sketchGreeting: "Hello! Your sketch feels {mood}. Belle has created a {style} palette. What do you think?",
    finalReviewMessage: "I've finished this artwork. Please give me your final critique.",
    finalReviewPrompt: "This artwork is complete. As Belle from Belleza Lab, give a thoughtful final critique with these sections: Emotional Impact, Technical Skill, Overall Harmony, and Exhibition Suggestion.",
    tapForFormula: "Tap to see the mixing guide",
    downloading: "Downloading...",
    downloadPalette: "Download palette card",
    analyzedBy: "Analyzed by Belle · Art Intelligence",
  },
} as const satisfies Record<Language, Record<string, string>>;

export type TranslationKey = keyof typeof translations.vi;

interface LanguageContextValue {
  language: Language;
  setLanguage: (language: Language) => void;
  t: (key: TranslationKey) => string;
}

const LanguageContext = React.createContext<LanguageContextValue | null>(null);

function getInitialLanguage(): Language {
  const savedLanguage = window.localStorage.getItem("belleza-language");
  if (savedLanguage === "vi" || savedLanguage === "en") return savedLanguage;
  return navigator.language.toLowerCase().startsWith("en") ? "en" : "vi";
}

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [language, setLanguage] = React.useState<Language>(getInitialLanguage);

  React.useEffect(() => {
    window.localStorage.setItem("belleza-language", language);
    document.documentElement.lang = language;
    document.title = translations[language].pageTitle;
    document
      .querySelector('meta[name="description"]')
      ?.setAttribute("content", translations[language].pageDescription);
    document
      .querySelector('meta[property="og:title"]')
      ?.setAttribute("content", translations[language].pageTitle);
    document
      .querySelector('meta[property="og:description"]')
      ?.setAttribute("content", translations[language].pageDescription);
    document
      .querySelector('meta[property="twitter:title"]')
      ?.setAttribute("content", translations[language].pageTitle);
    document
      .querySelector('meta[property="twitter:description"]')
      ?.setAttribute("content", translations[language].pageDescription);
  }, [language]);

  const value = React.useMemo(
    () => ({
      language,
      setLanguage,
      t: (key: TranslationKey) => translations[language][key],
    }),
    [language],
  );

  return <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>;
}

export function useLanguage() {
  const context = React.useContext(LanguageContext);
  if (!context) throw new Error("useLanguage must be used within LanguageProvider.");
  return context;
}
