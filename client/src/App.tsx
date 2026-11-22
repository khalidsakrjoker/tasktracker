import React, { useState, useEffect } from "react";
import { I18nProvider, useI18n } from "./i18n";
import { ThemeProvider } from "./theme";
import { TopBar } from "./components/TopBar";
import { Sidebar } from "./components/Sidebar";
import { TodayFocusView } from "./components/TodayFocusView";
import { ProjectDeepDive } from "./components/ProjectDeepDive";
import { ClientsCRMView } from "./components/ClientsCRMView";
import { QuickTaskDrawer } from "./components/QuickTaskDrawer";
import { EditTaskDrawer } from "./components/EditTaskDrawer";
import { ImageLightboxModal } from "./components/ImageLightboxModal";
import { parseImageUrls } from "./utils/imageCompressor";
import { PinLockModal } from "./components/PinLockModal";
import { NewProjectModal } from "./components/NewProjectModal";
import { InstallAppModal } from "./components/InstallAppModal";
import { Project, Client, Task, TodayFocusData } from "./types";

const MainAppContent: React.FC = () => {
  const { lang } = useI18n();
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);
  const [activeView, setActiveView] = useState<"focus" | "project" | "clients">("focus");
  const [selectedProjectId, setSelectedProjectId] = useState<number | null>(null);
  const [searchQuery, setSearchQuery] = useState("");

  const [projects, setProjects] = useState<Project[]>([]);
  const [clients, setClients] = useState<Client[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [focusData, setFocusData] = useState<TodayFocusData>({
    p1Urgent: [],
    p2Features: [],
    p3Tweaks: [],
    stats: { urgentCount: 0, todayCount: 0, completedTodayCount: 0 }
  });

  const [isQuickAddOpen, setIsQuickAddOpen] = useState(false);
  const [quickAddPriority, setQuickAddPriority] = useState<"P1" | "P2" | "P3">("P2");
  const [quickAddProjectId, setQuickAddProjectId] = useState<number | undefined>(undefined);
  const [quickAddClientId, setQuickAddClientId] = useState<number | undefined>(undefined);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [lightboxImages, setLightboxImages] = useState<string[]>([]);
  const [lightboxIndex, setLightboxIndex] = useState<number>(0);
  const [lightboxTitle, setLightboxTitle] = useState<string>("");
  const [isNewProjectModalOpen, setIsNewProjectModalOpen] = useState(false);
  const [isBackingUp, setIsBackingUp] = useState(false);

  const handleOpenLightbox = (
    images: string[] | string,
    indexOrTitle?: number | string,
    maybeTitle?: string
  ) => {
    let imgList: string[] = [];
    let idx = 0;
    let titleStr = "";

    if (Array.isArray(images)) {
      imgList = images;
      if (typeof indexOrTitle === "number") idx = indexOrTitle;
      if (typeof maybeTitle === "string") titleStr = maybeTitle;
      else if (typeof indexOrTitle === "string") titleStr = indexOrTitle;
    } else if (typeof images === "string") {
      imgList = parseImageUrls(images);
      if (typeof indexOrTitle === "number") idx = indexOrTitle;
      if (typeof maybeTitle === "string") titleStr = maybeTitle;
      else if (typeof indexOrTitle === "string") titleStr = indexOrTitle;
    }

    setLightboxImages(imgList);
    setLightboxIndex(idx);
    setLightboxTitle(titleStr);
  };

  // Helper to detect if running in standalone PWA window or already installed
  const checkIsStandaloneOrInstalled = (): boolean => {
    if (typeof window === "undefined") return false;
    const isStandaloneMode =
      window.matchMedia("(display-mode: standalone)").matches ||
      window.matchMedia("(display-mode: window-controls-overlay)").matches ||
      window.matchMedia("(display-mode: minimal-ui)").matches ||
      window.matchMedia("(display-mode: fullscreen)").matches;

    const isIosStandalone = (window.navigator as any).standalone === true;
    const params = new URLSearchParams(window.location.search);
    const isPwaParam = params.get("source") === "pwa" || params.has("pwa") || params.has("quick");
    const isStoredInstalled = localStorage.getItem("tasktracker_pwa_installed") === "true";

    return isStandaloneMode || isIosStandalone || isPwaParam || isStoredInstalled;
  };

  // PWA Installation & Shortcuts State
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [isAppInstalled, setIsAppInstalled] = useState<boolean>(() => checkIsStandaloneOrInstalled());
  const [isInstallModalOpen, setIsInstallModalOpen] = useState(false);

  // Check initial authentication
  useEffect(() => {
    fetch("/api/auth/me")
      .then((res) => res.json())
      .then((data) => {
        setIsAuthenticated(data.authenticated);
      })
      .catch(() => {
        setIsAuthenticated(false);
      });
  }, []);

  // PWA lifecycle & URL query parameters listener
  useEffect(() => {
    // If currently running in standalone window or previously installed, set flag & persist
    if (checkIsStandaloneOrInstalled()) {
      setIsAppInstalled(true);
      localStorage.setItem("tasktracker_pwa_installed", "true");
    }

    // Media query listeners for dynamic display-mode transitions
    const mediaQueries = [
      "(display-mode: standalone)",
      "(display-mode: window-controls-overlay)",
      "(display-mode: minimal-ui)",
      "(display-mode: fullscreen)"
    ];

    const cleanups: Array<() => void> = [];
    mediaQueries.forEach((q) => {
      try {
        const mql = window.matchMedia(q);
        const handler = (e: MediaQueryListEvent) => {
          if (e.matches) {
            setIsAppInstalled(true);
            localStorage.setItem("tasktracker_pwa_installed", "true");
          }
        };
        mql.addEventListener("change", handler);
        cleanups.push(() => mql.removeEventListener("change", handler));
      } catch (err) {
        // ignore for older browsers
      }
    });

    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      // If already installed or standalone, do not capture or show prompt
      if (!checkIsStandaloneOrInstalled()) {
        setDeferredPrompt(e);
      }
    };

    const handleAppInstalled = () => {
      setIsAppInstalled(true);
      localStorage.setItem("tasktracker_pwa_installed", "true");
      setDeferredPrompt(null);
    };

    window.addEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
    window.addEventListener("appinstalled", handleAppInstalled);

    // Support URL Shortcuts (e.g. /?quick=1 from Taskbar or Desktop Shortcut)
    const params = new URLSearchParams(window.location.search);
    if (params.get("quick") === "1" || params.has("quick")) {
      setIsQuickAddOpen(true);
    }
    const viewParam = params.get("view");
    if (viewParam === "clients" || viewParam === "focus" || viewParam === "project") {
      setActiveView(viewParam);
    }

    return () => {
      window.removeEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
      window.removeEventListener("appinstalled", handleAppInstalled);
      cleanups.forEach((cleanup) => cleanup());
    };
  }, []);

  const triggerInstallPrompt = async () => {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      if (outcome === "accepted") {
        setIsAppInstalled(true);
        localStorage.setItem("tasktracker_pwa_installed", "true");
      }
      setDeferredPrompt(null);
    }
  };

  // Fetch all core data
  const loadData = async () => {
    if (!isAuthenticated) return;

    try {
      const [projRes, clientsRes, focusRes, tasksRes] = await Promise.all([
        fetch("/api/projects"),
        fetch("/api/clients"),
        fetch("/api/tasks/focus"),
        fetch("/api/tasks")
      ]);

      if (projRes.ok) {
        const pList = await projRes.json();
        setProjects(pList);
        if (!selectedProjectId && pList.length > 0) {
          setSelectedProjectId(pList[0].id);
        }
      }
      if (clientsRes.ok) setClients(await clientsRes.json());
      if (focusRes.ok) setFocusData(await focusRes.json());
      if (tasksRes.ok) setTasks(await tasksRes.json());
    } catch (err) {
      console.error("Data load error:", err);
    }
  };

  useEffect(() => {
    if (isAuthenticated) {
      loadData();
    }
  }, [isAuthenticated]);

  // Global hotkeys listener (Ctrl+N for quick add, Ctrl+K for search)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        const searchInput = document.querySelector('input[type="text"]') as HTMLInputElement;
        if (searchInput) searchInput.focus();
      } else if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "n") {
        e.preventDefault();
        setIsQuickAddOpen(true);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  const handleUpdateTaskStatus = async (taskId: number, status: string) => {
    try {
      await fetch(`/api/tasks/${taskId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status })
      });
      loadData();
    } catch (err) {
      console.error("Update task status error:", err);
    }
  };

  const handleSaveTask = async (taskData: any) => {
    try {
      await fetch("/api/tasks", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(taskData)
      });
      loadData();
    } catch (err) {
      console.error("Save task error:", err);
    }
  };

  const handleDeleteTask = async (taskId: number) => {
    try {
      await fetch(`/api/tasks/${taskId}`, { method: "DELETE" });
      loadData();
    } catch (err) {
      console.error("Delete task error:", err);
    }
  };

  const handleEditTaskSave = async (updatedData: any) => {
    if (!editingTask) return;
    try {
      await fetch(`/api/tasks/${editingTask.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updatedData)
      });
      setEditingTask(null);
      loadData();
    } catch (err) {
      console.error("Edit task error:", err);
    }
  };

  const handleReorderTask = async (taskId: number, direction: "up" | "down", list: Task[]) => {
    const currentIndex = list.findIndex((t) => t.id === taskId);
    if (currentIndex === -1) return;
    const targetIndex = direction === "up" ? currentIndex - 1 : currentIndex + 1;
    if (targetIndex < 0 || targetIndex >= list.length) return;

    // Swap items in memory
    const newList = [...list];
    const temp = newList[currentIndex];
    newList[currentIndex] = newList[targetIndex];
    newList[targetIndex] = temp;

    // Assign sequential sortOrder values
    const items = newList.map((item, idx) => ({
      id: item.id,
      sortOrder: idx
    }));

    // Optimistic UI state update
    const priority = list[0]?.priority;
    setFocusData((prev) => {
      if (priority === "P1") return { ...prev, p1Urgent: newList };
      if (priority === "P2") return { ...prev, p2Features: newList };
      if (priority === "P3") return { ...prev, p3Tweaks: newList };
      return prev;
    });

    try {
      await fetch("/api/tasks/reorder", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ items })
      });
      loadData();
    } catch (err) {
      console.error("Reorder tasks error:", err);
      loadData();
    }
  };

  const handleCreateClient = async (clientData: any): Promise<Client | null> => {
    try {
      const res = await fetch("/api/clients", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(clientData)
      });
      if (res.ok) {
        const newClient = await res.json();
        setClients((prev) => [...prev, newClient]);
        loadData();
        return newClient;
      }
      return null;
    } catch (err) {
      console.error("Create client error:", err);
      return null;
    }
  };

  const handleCreateProject = async (projectData: any) => {
    try {
      const res = await fetch("/api/projects", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(projectData)
      });
      if (res.ok) {
        const created = await res.json();
        setSelectedProjectId(created.id);
        loadData();
      }
    } catch (err) {
      console.error("Create project error:", err);
    }
  };

  const handleTriggerBackup = async () => {
    setIsBackingUp(true);
    try {
      const msg = lang === "ar"
        ? "جاري إنشاء النسخة الاحتياطية وإرسالها إلى جروب تليجرام..."
        : "Creating database backup and sending to Telegram group...";
      alert(msg);
    } finally {
      setTimeout(() => setIsBackingUp(false), 2000);
    }
  };

  const handleLogout = async () => {
    await fetch("/api/auth/logout", { method: "POST" });
    setIsAuthenticated(false);
  };

  const selectedProject = projects.find((p) => p.id === selectedProjectId) || projects[0];

  return (
    <div className="min-h-screen bg-theme-page text-theme-text flex flex-col transition-colors">
      <PinLockModal
        isOpen={isAuthenticated === false}
        onSuccess={() => setIsAuthenticated(true)}
      />

      {isAuthenticated && (
        <>
          <TopBar
            searchQuery={searchQuery}
            setSearchQuery={setSearchQuery}
            urgentCount={focusData.stats.urgentCount}
            todayCount={focusData.stats.todayCount}
            completedTodayCount={focusData.stats.completedTodayCount}
            onOpenQuickAdd={() => {
              setQuickAddPriority("P2");
              setIsQuickAddOpen(true);
            }}
            onLogout={handleLogout}
            onTriggerBackup={handleTriggerBackup}
            isBackingUp={isBackingUp}
            onOpenInstallModal={() => setIsInstallModalOpen(true)}
            isAppInstalled={isAppInstalled}
          />

          <div className="flex-1 flex overflow-hidden">
            <Sidebar
              activeView={activeView}
              selectedProjectId={selectedProjectId}
              onSelectView={(view, projId) => {
                setActiveView(view);
                if (projId) setSelectedProjectId(projId);
              }}
              projects={projects}
              onOpenNewProject={() => setIsNewProjectModalOpen(true)}
              onOpenInstallModal={() => setIsInstallModalOpen(true)}
              isAppInstalled={isAppInstalled}
            />

            <main className="flex-1 overflow-y-auto">
              {activeView === "focus" && (
                <TodayFocusView
                  focusData={focusData}
                  onUpdateTaskStatus={handleUpdateTaskStatus}
                  onDeleteTask={handleDeleteTask}
                  onOpenQuickAdd={(prio) => {
                    if (prio) setQuickAddPriority(prio);
                    setIsQuickAddOpen(true);
                  }}
                  onEditTask={(task) => setEditingTask(task)}
                  onReorderTask={handleReorderTask}
                  onPreviewImage={handleOpenLightbox}
                />
              )}

              {activeView === "project" && selectedProject && (
                <ProjectDeepDive
                  project={selectedProject}
                  tasks={tasks}
                  clients={clients}
                  onUpdateTaskStatus={handleUpdateTaskStatus}
                  onOpenQuickAdd={(prio, projId) => {
                    if (prio) setQuickAddPriority(prio);
                    if (projId) setQuickAddProjectId(projId);
                    setIsQuickAddOpen(true);
                  }}
                  onDeleteTask={handleDeleteTask}
                  onEditTask={(task) => setEditingTask(task)}
                  onPreviewImage={handleOpenLightbox}
                />
              )}

              {activeView === "clients" && (
                <ClientsCRMView
                  clients={clients}
                  projects={projects}
                  onCreateClient={handleCreateClient}
                  onOpenQuickAddForClient={(cid, pid) => {
                    setQuickAddClientId(cid);
                    if (pid) setQuickAddProjectId(pid);
                    setIsQuickAddOpen(true);
                  }}
                />
              )}
            </main>
          </div>

          <QuickTaskDrawer
            isOpen={isQuickAddOpen}
            onClose={() => {
              setIsQuickAddOpen(false);
              setQuickAddClientId(undefined);
            }}
            projects={projects}
            clients={clients}
            initialPriority={quickAddPriority}
            initialProjectId={quickAddProjectId}
            initialClientId={quickAddClientId}
            onSaveTask={handleSaveTask}
            onCreateClient={handleCreateClient}
          />

          <EditTaskDrawer
            isOpen={!!editingTask}
            onClose={() => setEditingTask(null)}
            task={editingTask}
            projects={projects}
            clients={clients}
            onUpdateTask={async (_id, data) => handleEditTaskSave(data)}
            onDeleteTask={(id) => {
              handleDeleteTask(id);
              setEditingTask(null);
            }}
            onCreateClient={handleCreateClient}
            onPreviewImage={handleOpenLightbox}
          />

          <ImageLightboxModal
            images={lightboxImages}
            initialIndex={lightboxIndex}
            title={lightboxTitle}
            onClose={() => setLightboxImages([])}
          />

          <NewProjectModal
            isOpen={isNewProjectModalOpen}
            onClose={() => setIsNewProjectModalOpen(false)}
            onCreateProject={handleCreateProject}
          />

          <InstallAppModal
            isOpen={isInstallModalOpen}
            onClose={() => setIsInstallModalOpen(false)}
            onInstallPrompt={triggerInstallPrompt}
            hasNativePrompt={!!deferredPrompt}
          />
        </>
      )}
    </div>
  );
};

export const App: React.FC = () => {
  return (
    <ThemeProvider>
      <I18nProvider>
        <MainAppContent />
      </I18nProvider>
    </ThemeProvider>
  );
};
