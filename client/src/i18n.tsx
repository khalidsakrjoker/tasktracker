import React, { createContext, useContext, useState, useEffect } from "react";

export type Language = "en" | "ar";

export interface Translations {
  // App brand & navigation
  appTitle: string;
  appSubtitle: string;
  focusView: string;
  clientsView: string;
  activeProjects: string;
  addProject: string;
  quickCaptureBtn: string;
  telegramBackup: string;
  sendingBackup: string;
  lockScreen: string;
  openSourceSignature: string;
  licenseText: string;
  vibeCodedBadge: string;
  installAppBtn: string;
  appInstalled: string;
  installModalTitle: string;
  installModalDescDesktop: string;
  installModalDescMobile: string;
  installModalAction: string;
  closeModal: string;
  quickCaptureShortcutNote: string;

  // Search
  searchPlaceholder: string;

  // Stats tickers
  urgentTicker: string;
  activeTicker: string;
  completedTicker: string;

  // Focus View
  focusTitle: string;
  focusMatrixBadge: string;
  focusSubtitle: string;
  p1EmergencyTitle: string;
  p1EmergencyEmpty: string;
  p1AddBtn: string;
  p2FeaturesTitle: string;
  p2FeaturesEmpty: string;
  p2AddBtn: string;
  p3TweaksTitle: string;
  p3TweaksEmpty: string;
  p3AddBtn: string;
  startBtn: string;
  pauseBtn: string;
  inProgressBadge: string;
  doneBtn: string;
  minAbbr: string;

  // Task types
  typeBug: string;
  typeFeature: string;
  typeTweak: string;
  typeSupport: string;

  // Task Priorities
  priorityP1: string;
  priorityP2: string;
  priorityP3: string;

  // Project Deep Dive
  openTasksCount: string;
  urgentTasksCount: string;
  completedTasksCount: string;
  addTaskToProject: string;
  allClientsFilter: string;
  filterAll: string;
  kanbanView: string;
  tableView: string;
  colBacklog: string;
  colToday: string;
  colInProgress: string;
  colDone: string;
  thTask: string;
  thPriority: string;
  thType: string;
  thClient: string;
  thStatus: string;
  thTime: string;
  thActions: string;
  deleteTask: string;
  editTaskBtn: string;
  editTaskTitle: string;
  attachImage: string;
  removeImage: string;
  imageAttached: string;
  moveUp: string;
  moveDown: string;
  pasteImageHint: string;
  defaultProjectDesc: string;

  // Clients CRM
  clientsTitle: string;
  clientsSubtitle: string;
  newClientBtn: string;
  clientsCounter: string;
  recordedTasks: string;
  newRequestForClient: string;
  clientModalTitle: string;
  clientNameLabel: string;
  clientNamePlaceholder: string;
  clientPhoneLabel: string;
  clientCompanyLabel: string;
  clientCompanyPlaceholder: string;
  clientProjectLabel: string;
  clientNoProject: string;
  clientNotesLabel: string;
  cancelBtn: string;
  saveClientBtn: string;

  // Quick Task Drawer
  drawerTitle: string;
  drawerSubtitle: string;
  taskTitleLabel: string;
  taskTitlePlaceholder: string;
  projectLabel: string;
  clientLabel: string;
  clientSearchPlaceholder: string;
  noClientOption: string;
  addNewClientOption: string;
  priorityLabel: string;
  typeLabel: string;
  estTimeLabel: string;
  time15m: string;
  time30m: string;
  time1h: string;
  time2h: string;
  time4h: string;
  detailsLabel: string;
  detailsPlaceholder: string;
  saveTaskSubmit: string;
  selectProject: string;
  moreProjects: string;

  // New Project Modal
  newProjectTitle: string;
  projectNameLabel: string;
  projectNamePlaceholder: string;
  projectCodeLabel: string;
  projectCodePlaceholder: string;
  accentColorLabel: string;
  customColorLabel: string;
  iconLabel: string;
  projectDescLabel: string;
  createProjectSubmit: string;

  // Pin Lock Modal
  loginSystemTitle: string;
  loginPinSubtitle: string;
  loginBlockedTitle: string;
  loginBlockedNotice: string;
  loginUnblockInstruction: string;
  loginPinPlaceholder: string;
  loginVerifying: string;
  loginSubmit: string;
  loginEncryptionNote: string;
  loginPinLengthError: string;
  loginPinIncorrect: string;
  loginNetworkError: string;
}

const translations: Record<Language, Translations> = {
  en: {
    appTitle: "TaskTracker",
    appSubtitle: "Project Operations Studio",
    focusView: "Today Focus Matrix",
    clientsView: "Clients & CRM Directory",
    activeProjects: "ACTIVE PROJECTS",
    addProject: "Add Project",
    quickCaptureBtn: "Quick Task (N)",
    telegramBackup: "Telegram Backup",
    sendingBackup: "Sending...",
    lockScreen: "Lock Screen",
    openSourceSignature: "Open Source Repository",
    licenseText: "MIT License • v1.0.0",
    vibeCodedBadge: "Vibe Coded",
    installAppBtn: "Install App",
    appInstalled: "Installed",
    installModalTitle: "Install TaskTracker Studio",
    installModalDescDesktop: "Install on your computer to run in a dedicated standalone window with Desktop and Taskbar quick shortcuts.",
    installModalDescMobile: "Tap the browser share or menu icon, then select 'Add to Home Screen' to use it as a native app on your phone.",
    installModalAction: "Install Now",
    closeModal: "Close",
    quickCaptureShortcutNote: "Press Ctrl + N anywhere to quick capture a task",

    searchPlaceholder: "Quick search across projects, clients & tasks (Ctrl + K)...",

    urgentTicker: "Urgent P1",
    activeTicker: "Active Tasks",
    completedTicker: "Done Today",

    focusTitle: "Unified Today Focus Matrix",
    focusMatrixBadge: "Cross-Project Matrix",
    focusSubtitle: "Zero clutter: Focus strictly on what your clients and projects require today.",
    p1EmergencyTitle: "🚨 P1 - Critical & Emergency",
    p1EmergencyEmpty: "Great! No urgent emergencies currently.",
    p1AddBtn: "Add Urgent Emergency",
    p2FeaturesTitle: "⚡ P2 - Core Development",
    p2FeaturesEmpty: "No core features scheduled for today.",
    p2AddBtn: "Add P2 Feature",
    p3TweaksTitle: "🛠️ P3 - Quick Tweaks & Support",
    p3TweaksEmpty: "No minor tweaks pending.",
    p3AddBtn: "Add P3 Tweak",
    startBtn: "Start",
    pauseBtn: "Pause",
    inProgressBadge: "In Progress",
    doneBtn: "Done",
    minAbbr: "m",

    typeBug: "Bug Fix",
    typeFeature: "Feature",
    typeTweak: "Tweak",
    typeSupport: "Support",

    priorityP1: "🔴 P1 - Critical Urgent",
    priorityP2: "🟡 P2 - Core Feature",
    priorityP3: "🟢 P3 - Minor Tweak",

    openTasksCount: "Open Tasks",
    urgentTasksCount: "P1 Urgent",
    completedTasksCount: "Completed",
    addTaskToProject: "Add Task",
    allClientsFilter: "All Clients",
    filterAll: "ALL",
    kanbanView: "Kanban",
    tableView: "High-Density Table",
    colBacklog: "Backlog",
    colToday: "Today Focus",
    colInProgress: "In Progress",
    colDone: "Completed",
    thTask: "Task",
    thPriority: "Priority",
    thType: "Type",
    thClient: "Client",
    thStatus: "Status",
    thTime: "Est. Time",
    thActions: "Actions",
    deleteTask: "Delete Task",
    editTaskBtn: "Edit Task",
    editTaskTitle: "Edit Task Details",
    attachImage: "Attach Screenshot / Image",
    removeImage: "Remove Image",
    imageAttached: "Attached Image",
    moveUp: "Move Up (Priority)",
    moveDown: "Move Down",
    pasteImageHint: "Or paste screenshot directly with Ctrl+V",
    defaultProjectDesc: "Active software project in TaskTracker Studio",

    clientsTitle: "Clients & Stakeholders Directory",
    clientsSubtitle: "Manage client contacts, software requests, and project associations seamlessly.",
    newClientBtn: "New Client",
    clientsCounter: "Clients",
    recordedTasks: "recorded tasks",
    newRequestForClient: "New Request",
    clientModalTitle: "Add New Client",
    clientNameLabel: "Client Name *",
    clientNamePlaceholder: "e.g. John Doe - Cairo Branch",
    clientPhoneLabel: "Phone / WhatsApp",
    clientCompanyLabel: "Company / Business Name",
    clientCompanyPlaceholder: "e.g. Retail Store, Hall, Delivery...",
    clientProjectLabel: "Associated Project",
    clientNoProject: "No specific project",
    clientNotesLabel: "Additional Notes",
    cancelBtn: "Cancel",
    saveClientBtn: "Save Client",

    drawerTitle: "Quick Capture Task",
    drawerSubtitle: "Offload ideas in 5 seconds and never lose track",
    taskTitleLabel: "Task / Request Title *",
    taskTitlePlaceholder: "e.g. Implement receipt print button for POS client",
    projectLabel: "Target Project *",
    clientLabel: "Client Requester (Optional)",
    clientSearchPlaceholder: "Search client by name or phone...",
    noClientOption: "No client selected",
    addNewClientOption: "+ Add client",
    priorityLabel: "Priority & Risk Level",
    typeLabel: "Task Type",
    estTimeLabel: "Estimated Time",
    time15m: "15 minutes",
    time30m: "30 minutes",
    time1h: "1 hour",
    time2h: "2 hours",
    time4h: "4 hours",
    detailsLabel: "Notes & Technical Details",
    detailsPlaceholder: "Code snippet, database table, or client request specs...",
    saveTaskSubmit: "Save Task (Enter)",
    selectProject: "Select Project...",
    moreProjects: "More Projects...",

    newProjectTitle: "Add New Software Project",
    projectNameLabel: "Project Name *",
    projectNamePlaceholder: "e.g. Delivery Mobile App",
    projectCodeLabel: "Project Code (Uppercase) *",
    projectCodePlaceholder: "e.g. DELIVERY",
    accentColorLabel: "Accent Color",
    customColorLabel: "Custom Color",
    iconLabel: "Project Icon",
    projectDescLabel: "Short Description",
    createProjectSubmit: "Create Project",

    loginSystemTitle: "TaskTracker Operations",
    loginPinSubtitle: "Enter 6-digit Master PIN for instant access",
    loginBlockedTitle: "Strict Hard IP Ban Active",
    loginBlockedNotice: "Your device IP has been permanently banned due to 3 failed attempts. To unblock immediately, open your Telegram group and run:",
    loginUnblockInstruction: "/unblock IP_ADDRESS",
    loginPinPlaceholder: "••••••",
    loginVerifying: "Verifying...",
    loginSubmit: "Confirm Access",
    loginEncryptionNote: "90-day encrypted authenticated session",
    loginPinLengthError: "Please enter the 6-digit PIN code",
    loginPinIncorrect: "Incorrect PIN code",
    loginNetworkError: "Failed to connect to server"
  },
  ar: {
    appTitle: "TaskTracker",
    appSubtitle: "مركز إدارة المشروعات",
    focusView: "لوحة التركيز اليومي",
    clientsView: "دليل العملاء والطلبات",
    activeProjects: "المشروعات النشطة",
    addProject: "إضافة مشروع",
    quickCaptureBtn: "مهمة خاطفة (N)",
    telegramBackup: "نسخ لتليجرام",
    sendingBackup: "جاري الإرسال...",
    lockScreen: "قفل الشاشة",
    openSourceSignature: "المستودع مفتوح المصدر",
    licenseText: "ترخيص MIT • الإصدار 1.0.0",
    vibeCodedBadge: "فايب كودينج",
    installAppBtn: "تثبيت التطبيق",
    appInstalled: "تم التثبيت",
    installModalTitle: "تثبيت تطبيق TaskTracker",
    installModalDescDesktop: "ثبّت التطبيق على جهاز الكمبيوتر لتشغيله في نافذة مستقلة مع أيقونة على سطح المكتب وشريط المهام والتشغيل السريع.",
    installModalDescMobile: "اضغط على زر المشاركة أو الثلاث نقاط في متصفحك ثم اختر 'إضافة إلى الشاشة الرئيسية' لتثبيته كتطبيق مباشر على هاتفك.",
    installModalAction: "تثبيت الآن",
    closeModal: "إغلاق",
    quickCaptureShortcutNote: "اضغط Ctrl + N في أي مكان لتسجيل مهمة خاطفة في ثوانٍ",

    searchPlaceholder: "بحث سريع في المشروعات والعملاء والمهام (Ctrl + K)...",

    urgentTicker: "طوارئ P1",
    activeTicker: "مهام جارية",
    completedTicker: "منجز اليوم",

    focusTitle: "لوحة التركيز اليومي الموحد",
    focusMatrixBadge: "مصفوفة المشروعات",
    focusSubtitle: "لا تشتت نفسك بـ 50 مهمة؛ ركز فقط على أهم ما يحتاجه عملاؤك ومشروعاتك اليوم.",
    p1EmergencyTitle: "🚨 P1 - طوارئ وعملاء",
    p1EmergencyEmpty: "رائع! لا توجد طوارئ معلقة حالياً.",
    p1AddBtn: "إضافة طارئ جديد",
    p2FeaturesTitle: "⚡ P2 - بناء وتطوير أساسي",
    p2FeaturesEmpty: "لا توجد ميزات مجدولة لليوم.",
    p2AddBtn: "إضافة مهمة تطوير P2",
    p3TweaksTitle: "🛠️ P3 - تحسينات ودعم سريع",
    p3TweaksEmpty: "لا توجد تعديلات خفيفة معلقة.",
    p3AddBtn: "إضافة تعديل خفيف P3",
    startBtn: "بدء",
    pauseBtn: "إيقاف مؤقت",
    inProgressBadge: "قيد التنفيذ",
    doneBtn: "تم",
    minAbbr: "د",

    typeBug: "إصلاح خطأ",
    typeFeature: "ميزة جديدة",
    typeTweak: "تعديل خفيف",
    typeSupport: "دعم فني",

    priorityP1: "🔴 P1 - طوارئ عاجلة",
    priorityP2: "🟡 P2 - تطوير وبناء",
    priorityP3: "🟢 P3 - تحسين هادئ",

    openTasksCount: "مهام متبقية",
    urgentTasksCount: "طوارئ P1",
    completedTasksCount: "مكتمل",
    addTaskToProject: "إضافة مهمة",
    allClientsFilter: "جميع العملاء",
    filterAll: "الكل",
    kanbanView: "كانبان",
    tableView: "جدول مكثف",
    colBacklog: "صندوق الانتظار",
    colToday: "التركيز اليومي",
    colInProgress: "قيد التنفيذ",
    colDone: "مكتمل",
    thTask: "المهمة",
    thPriority: "الأولوية",
    thType: "النوع",
    thClient: "العميل",
    thStatus: "الحالة",
    thTime: "الوقت",
    thActions: "إجراءات",
    deleteTask: "حذف المهمة",
    editTaskBtn: "تعديل المهمة",
    editTaskTitle: "تعديل تفاصيل المهمة",
    attachImage: "إرفاق صورة / سكرين شوت",
    removeImage: "إزالة الصورة",
    imageAttached: "صورة مرفقة",
    moveUp: "تقديم لأعلى (أهمية)",
    moveDown: "تأخير لأسفل",
    pasteImageHint: "أو الصق السكرين شوت مباشرة بـ Ctrl+V",
    defaultProjectDesc: "مشروع نشط في نظام TaskTracker",

    clientsTitle: "دليل العملاء والمستفيدين",
    clientsSubtitle: "سجل عملاء المشروعات؛ تواصل معهم وتابع طلباتهم بدون نسيان.",
    newClientBtn: "عميل جديد",
    clientsCounter: "عميل",
    recordedTasks: "مهمة مسجلة",
    newRequestForClient: "طلب جديد",
    clientModalTitle: "إضافة عميل جديد",
    clientNameLabel: "اسم العميل *",
    clientNamePlaceholder: "مثال: أ/ محمد - فرع الهرم",
    clientPhoneLabel: "رقم الهاتف / الواتساب",
    clientCompanyLabel: "اسم الشركة / النشاط",
    clientCompanyPlaceholder: "سوبرماركت، قاعة، محطة بنزين...",
    clientProjectLabel: "المشروع المرتبط",
    clientNoProject: "بدون مشروع محدد",
    clientNotesLabel: "ملاحظات إضافية",
    cancelBtn: "إلغاء",
    saveClientBtn: "حفظ العميل",

    drawerTitle: "تسجيل مهمة خاطفة (Quick Capture)",
    drawerSubtitle: "فرّغ المهمة من عقلك في 5 ثوانٍ ولن تضيع أبداً",
    taskTitleLabel: "عنوان المهمة / الطلب *",
    taskTitlePlaceholder: "مثال: تعديل زر طباعة الإيصال لعميل الهرم",
    projectLabel: "المشروع التابع له *",
    clientLabel: "العميل مقدم الطلب (اختياري)",
    clientSearchPlaceholder: "ابحث باسم أو رقم العميل...",
    noClientOption: "بدون عميل محدد",
    addNewClientOption: "+ إضافة عميل",
    priorityLabel: "الأولوية ومستوى الخطر",
    typeLabel: "نوع المهمة",
    estTimeLabel: "الوقت المقدر",
    time15m: "15 دقيقة",
    time30m: "30 دقيقة",
    time1h: "ساعة واحدة",
    time2h: "ساعتان",
    time4h: "4 ساعات",
    detailsLabel: "ملاحظات وتفاصيل الكود",
    detailsPlaceholder: "سطر كود، دالة، جدول في الداتابيز، أو متطلبات العميل بالتفصيل...",
    saveTaskSubmit: "حفظ المهمة (Enter)",
    selectProject: "اختر المشروع...",
    moreProjects: "مشروعات إضافية...",

    newProjectTitle: "إضافة مشروع برمجي جديد",
    projectNameLabel: "اسم المشروع *",
    projectNamePlaceholder: "مثال: تطبيق توصيل الطلبات",
    projectCodeLabel: "كود المشروع (مختصر بالإنجليزية) *",
    projectCodePlaceholder: "مثال: DELIVERY",
    accentColorLabel: "لون التمييز",
    customColorLabel: "لون مخصص",
    iconLabel: "الأيقونة",
    projectDescLabel: "وصف مختصر",
    createProjectSubmit: "إنشاء المشروع",

    loginSystemTitle: "نظام إدارة المشروعات",
    loginPinSubtitle: "أدخل رمز الـ PIN المكون من 6 أرقام للوصول المباشر",
    loginBlockedTitle: "تم تفعيل الحظر الصارم (Hard IP Ban)",
    loginBlockedNotice: "تم حظر عنوان جهازك من السيرفر تماماً لتجاوز 3 محاولات خاطئة. لفك الحظر فوراً، افتح جروب التليجرام الخاص بك وأرسل:",
    loginUnblockInstruction: "/unblock IP_ADDRESS",
    loginPinPlaceholder: "••••••",
    loginVerifying: "جاري التحقق...",
    loginSubmit: "تأكيد الدخول",
    loginEncryptionNote: "حماية مشفرة ممتدة 90 يوماً",
    loginPinLengthError: "الرجاء إدخال رمز المرور المكون من 6 أرقام",
    loginPinIncorrect: "رمز PIN غير صحيح",
    loginNetworkError: "حدث خطأ في الاتصال بالسيرفر"
  }
};

interface I18nContextType {
  lang: Language;
  setLang: (lang: Language) => void;
  t: (key: keyof Translations) => string;
}

const I18nContext = createContext<I18nContextType>({
  lang: "en",
  setLang: () => {},
  t: (key) => translations.en[key]
});

export const I18nProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [lang, setLangState] = useState<Language>(() => {
    const saved = localStorage.getItem("tasktracker_lang");
    return (saved === "ar" || saved === "en") ? saved : "en";
  });

  const setLang = (newLang: Language) => {
    setLangState(newLang);
    localStorage.setItem("tasktracker_lang", newLang);
  };

  useEffect(() => {
    document.documentElement.lang = lang;
    document.documentElement.dir = lang === "ar" ? "rtl" : "ltr";
    document.title = lang === "ar"
      ? "TaskTracker • مركز التحكم وإدارة المشروعات"
      : "TaskTracker • Studio & Project Management";
  }, [lang]);

  const t = (key: keyof Translations): string => {
    return translations[lang][key] || translations.en[key] || "";
  };

  return (
    <I18nContext.Provider value={{ lang, setLang, t }}>
      {children}
    </I18nContext.Provider>
  );
};

export const useI18n = () => useContext(I18nContext);
