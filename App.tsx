
import React, { useState, useEffect, useRef } from 'react';
import { generateImage, editImageWithFlash, generateArchitecturalVideo, setApiKey } from './services/geminiService';
import { ARCHITECTURAL_STYLES, VIEW_ANGLES, INITIAL_PROMPT, RESOLUTIONS, ASPECT_RATIOS, MATERIALS, RENDER_PRESETS } from './constants';
import type { ImageResolution, AspectRatio } from './types';

// --- Authentication Constants ---
const ADMIN_PASSWORD = '0172';
const ADMIN_API_KEY = process.env.API_KEY || process.env.GEMINI_API_KEY || 'AIzaSyDJt7iXIgNJ9LrqsDiRkvIjHG7H_bqSWLg';
const MAX_FILE_SIZE_MB = 20;

// --- Types ---
interface HistoryItem {
  src: string;
  label: string;
  timestamp: number;
}

// --- Professional Icons ---
const SketchIcon = ({ className }: { className?: string }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" /></svg>
);
const FilmIcon = ({ className }: { className?: string }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 00-2 2z" /></svg>
);
const MaterialIcon = ({ className }: { className?: string }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" /></svg>
);
const SparklesIcon = ({ className }: { className?: string }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" /></svg>
);
const UploadIcon = ({ className }: { className?: string }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16v1a2 2 0 002 2h12a2 2 0 002-2v-1m-4-8l-4-4m0 0L8 8m4-4v12" /></svg>
);
const KeyIcon = ({ className }: { className?: string }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15.75 5.25a3 3 0 013 3m3 0a6 6 0 01-7.029 5.912c-.563-.097-1.159.026-1.563.43L10.5 17.25H8.25v2.25H6v2.25H2.25v-2.818c0-.597.237-1.17.659-1.591l6.499-6.499c.404-.404.527-1 .43-1.563A6 6 0 1121.75 8.25Z" /></svg>
);
const ArrowRight = ({ className }: { className?: string }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" /></svg>
);
const DownloadIcon = ({ className }: { className?: string }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a2 2 0 002 2h12a2 2 0 002-2v-1m-4-4l-4 4m0 0l-4-4m4 4V4" /></svg>
);
const BuildingIcon = ({ className }: { className?: string }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" /></svg>
);
const LockIcon = ({ className }: { className?: string }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z" /></svg>
);
const CloseIcon = ({ className }: { className?: string }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
);
const UndoIcon = ({ className }: { className?: string }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h10a5 5 0 015 5v2M3 10l4-4m-4 4l4 4" /></svg>
);

// --- Accent color options ---
const ACCENT_COLORS = [
  { id: 'red', color: '#E16259', name: '클래식 레드' },
  { id: 'blue', color: '#4A90D9', name: '스카이 블루' },
  { id: 'green', color: '#4CAF50', name: '포레스트 그린' },
  { id: 'purple', color: '#7E57C2', name: '로얄 퍼플' },
  { id: 'orange', color: '#FF7043', name: '선셋 오렌지' },
  { id: 'teal', color: '#26A69A', name: '오션 틸' },
];

// --- Sub Components ---
const LoadingSpinner = () => {
  const steps = ["스케치 분석 중...", "3D 구조 생성 중...", "텍스처 렌더링 중...", "최종 마무리 중..."];
  const [stepIdx, setStepIdx] = useState(0);
  useEffect(() => {
    const timer = setInterval(() => setStepIdx((prev) => Math.min(prev + 1, steps.length - 1)), 4000);
    return () => clearInterval(timer);
  }, []);
  return (
    <div className="flex flex-col items-center justify-center space-y-6 w-full max-w-xs">
      <div className="animate-spin rounded-full h-14 w-14 border-t-2 border-b-2 border-architect-main"></div>
      <div className="w-full space-y-3">
        <div className="w-full bg-architect-bg rounded-full overflow-hidden">
          <div className="progress-bar"></div>
        </div>
        <div className="flex justify-between">
          {steps.map((step, i) => (
            <div key={i} className={`w-2 h-2 rounded-full transition-all duration-500 ${i <= stepIdx ? 'accent-bg scale-100' : 'bg-architect-border scale-75'
              }`} />
          ))}
        </div>
        <p className="text-sm text-architect-sub text-center font-bold">{steps[stepIdx]}</p>
      </div>
    </div>
  );
};

const VideoLoadingSpinner = () => {
  const messages = ["시네마틱 투어를 준비 중입니다...", "조명과 그림자를 계산 중입니다...", "거의 완료되었습니다."];
  const [msgIdx, setMsgIdx] = useState(0);
  useEffect(() => {
    const timer = setInterval(() => setMsgIdx((prev) => (prev + 1) % messages.length), 3000);
    return () => clearInterval(timer);
  }, []);
  return (
    <div className="flex flex-col items-center justify-center space-y-6 max-w-sm text-center">
      <div className="animate-spin rounded-full h-18 w-18 border-t-2 border-b-2 border-architect-accent"></div>
      <div className="w-48 bg-architect-bg rounded-full overflow-hidden">
        <div className="progress-bar"></div>
      </div>
      <p className="text-xl font-bold text-architect-main">{messages[msgIdx]}</p>
    </div>
  );
};

// --- Main App Component ---
export default function App() {
  const [view, setView] = useState<'landing' | 'tool'>('landing');
  const [sketchFile, setSketchFile] = useState<File | null>(null);
  const [sketchPreview, setSketchPreview] = useState<string | null>(null);
  const [prompt, setPrompt] = useState<string>(INITIAL_PROMPT);
  const [baseGeneratedImage, setBaseGeneratedImage] = useState<string | null>(null);
  const [displayedImage, setDisplayedImage] = useState<string | null>(null);
  const [displayedVideo, setDisplayedVideo] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isVideoLoading, setIsVideoLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const [resolution, setResolution] = useState<ImageResolution>('1K');
  const [aspectRatio, setAspectRatio] = useState<AspectRatio>('1:1');
  const [editPrompt, setEditPrompt] = useState<string>("");
  const [selectedTarget, setSelectedTarget] = useState('floor');
  const [selectedMaterial, setSelectedMaterial] = useState('marble texture');

  // --- Authentication State ---
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [authMode, setAuthMode] = useState<'password' | 'apikey'>('password');
  const [authInput, setAuthInput] = useState('');
  const [authError, setAuthError] = useState<string | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  // --- Image History State ---
  const [imageHistory, setImageHistory] = useState<HistoryItem[]>([]);

  // --- Drag & Drop State ---
  const [isDragOver, setIsDragOver] = useState(false);
  const [accentColor, setAccentColor] = useState('red');

  const fileInputRef = useRef<HTMLInputElement>(null);
  const galleryRef = useRef<HTMLDivElement>(null);

  // --- Error Auto-dismiss (8 seconds) ---
  useEffect(() => {
    if (error) {
      const timer = setTimeout(() => setError(null), 8000);
      return () => clearTimeout(timer);
    }
  }, [error]);

  // --- Helper: Add image to history ---
  const addToHistory = (src: string, label: string) => {
    setImageHistory(prev => [...prev, { src, label, timestamp: Date.now() }]);
  };

  // --- Helper: Undo to previous image ---
  const handleUndo = () => {
    if (imageHistory.length < 2) return;
    const newHistory = [...imageHistory];
    newHistory.pop(); // Remove current
    const previous = newHistory[newHistory.length - 1];
    setImageHistory(newHistory);
    setDisplayedImage(previous.src);
  };

  // --- Helper: Load image from gallery ---
  const handleGalleryClick = (item: HistoryItem) => {
    setDisplayedImage(item.src);
    setDisplayedVideo(null);
  };

  // --- Authentication ---
  const handleStart = () => {
    if (isAuthenticated) {
      setView('tool');
    } else {
      setShowAuthModal(true);
      setAuthInput('');
      setAuthError(null);
    }
  };

  const handleAuthSubmit = () => {
    setAuthError(null);

    if (authMode === 'password') {
      if (authInput === ADMIN_PASSWORD) {
        if (ADMIN_API_KEY && ADMIN_API_KEY !== 'PLACEHOLDER_API_KEY') {
          setApiKey(ADMIN_API_KEY);
          setIsAuthenticated(true);
          setShowAuthModal(false);
          setView('tool');
        } else {
          setAuthError('서버에 관리자 API 키가 설정되지 않았습니다. 직접 API 키를 입력해주세요.');
        }
      } else {
        setAuthError('비밀번호가 올바르지 않습니다.');
      }
    } else {
      const trimmedKey = authInput.trim();
      if (!trimmedKey) {
        setAuthError('API 키를 입력해주세요.');
        return;
      }
      if (trimmedKey.length < 10) {
        setAuthError('유효하지 않은 API 키 형식입니다.');
        return;
      }
      setApiKey(trimmedKey);
      setIsAuthenticated(true);
      setShowAuthModal(false);
      setView('tool');
    }
  };

  const handleAuthKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleAuthSubmit();
    }
  };

  // --- New Project: Reset work, keep authentication ---
  const handleNewProject = () => {
    setSketchFile(null);
    setSketchPreview(null);
    setPrompt(INITIAL_PROMPT);
    setBaseGeneratedImage(null);
    setDisplayedImage(null);
    setDisplayedVideo(null);
    setImageHistory([]);
    setError(null);
    setEditPrompt('');
    setIsLoading(false);
    setIsVideoLoading(false);
    setSelectedTarget('floor');
    setSelectedMaterial('marble texture');
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  // --- Exit Tool: Full State Reset ---
  const handleExitTool = () => {
    handleNewProject();
    setIsAuthenticated(false);
    setView('landing');
  };

  // --- File Validation ---
  const validateFile = (file: File): string | null => {
    const maxSize = MAX_FILE_SIZE_MB * 1024 * 1024;
    if (file.size > maxSize) {
      return `파일 크기가 너무 큽니다. 최대 ${MAX_FILE_SIZE_MB}MB까지 업로드 가능합니다. (현재: ${(file.size / 1024 / 1024).toFixed(1)}MB)`;
    }
    if (!file.type.startsWith('image/')) {
      return '이미지 파일만 업로드 가능합니다. (JPG, PNG, WEBP 등)';
    }
    return null;
  };

  const processFile = (file: File) => {
    const validationError = validateFile(file);
    if (validationError) {
      setError(validationError);
      return;
    }
    setSketchFile(file);
    const reader = new FileReader();
    reader.onloadend = () => setSketchPreview(reader.result as string);
    reader.readAsDataURL(file);
    setBaseGeneratedImage(null);
    setDisplayedImage(null);
    setDisplayedVideo(null);
    setImageHistory([]);
    setError(null);
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) processFile(file);
  };

  // --- Drag & Drop Handlers ---
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(false);
    const file = e.dataTransfer.files?.[0];
    if (file) processFile(file);
  };

  // --- Generation Handlers ---
  const handleGenerate = async () => {
    if (!sketchFile) return;
    setIsLoading(true);
    setDisplayedVideo(null);
    setError(null);
    try {
      const generated = await generateImage({ prompt, imageFile: sketchFile, resolution, aspectRatio });
      setBaseGeneratedImage(generated);
      setDisplayedImage(generated);
      addToHistory(generated, '3D Render');
    } catch (e: any) {
      setError(e.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleGenerateCinematic = async () => {
    if (!baseGeneratedImage) return;
    setIsVideoLoading(true);
    setError(null);
    try {
      const videoUrl = await generateArchitecturalVideo(baseGeneratedImage, aspectRatio);
      setDisplayedVideo(videoUrl);
    } catch (e: any) {
      setError(e.message);
    } finally {
      setIsVideoLoading(false);
    }
  };

  const handleStyleOrViewChange = async (changePrompt: string, type: 'style' | 'view', label: string) => {
    if (!baseGeneratedImage) return;
    setIsLoading(true);
    setDisplayedVideo(null);
    setError(null);
    try {
      let changedImage: string;
      if (type === 'style') {
        // Use editImageWithFlash to preserve building structure, only change facade
        changedImage = await editImageWithFlash(baseGeneratedImage, changePrompt);
      } else {
        // View changes need full re-generation
        const fullPrompt = `Show ${changePrompt} view.`;
        changedImage = await generateImage({ prompt: fullPrompt, base64Image: baseGeneratedImage, resolution, aspectRatio });
      }
      setDisplayedImage(changedImage);
      addToHistory(changedImage, label);
    } catch (e: any) { setError(e.message); } finally { setIsLoading(false); }
  };

  const handleMaterialSimulation = async () => {
    if (!baseGeneratedImage) return;
    setIsLoading(true);
    setDisplayedVideo(null);
    setError(null);
    const simulationPrompt = `Change only the ${selectedTarget} of the building to ${selectedMaterial}.`;
    try {
      const editedImage = await editImageWithFlash(baseGeneratedImage, simulationPrompt);
      setDisplayedImage(editedImage);
      addToHistory(editedImage, `${selectedTarget} → ${selectedMaterial}`);
    } catch (e: any) { setError(e.message); } finally { setIsLoading(false); }
  };

  const handleTextEdit = async () => {
    if (!baseGeneratedImage || !editPrompt.trim()) return;
    setIsLoading(true);
    setDisplayedVideo(null);
    setError(null);
    try {
      const editedImage = await editImageWithFlash(baseGeneratedImage, editPrompt);
      setDisplayedImage(editedImage);
      addToHistory(editedImage, editPrompt.substring(0, 20) + (editPrompt.length > 20 ? '...' : ''));
    } catch (e: any) { setError(e.message); } finally { setIsLoading(false); }
  };

  // =============================================
  // LANDING PAGE
  // =============================================
  if (view === 'landing') {
    return (
      <div className="min-h-screen bg-architect-bg text-architect-main selection:bg-architect-accent selection:text-white" data-accent={accentColor}>
        {/* Navigation — Glassmorphism */}
        <nav className="fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-md border-b border-architect-border/50">
          <div className="flex items-center justify-between px-10 py-5 max-w-[1300px] mx-auto">
            <div className="flex items-center gap-4">
              <div className="text-xl font-black tracking-tighter">ARCHI RENDER</div>
              <span className="hidden sm:inline-block px-2 py-0.5 rounded-full text-[10px] font-bold accent-bg text-white tracking-wider">v2.5</span>
            </div>
            <div className="flex items-center gap-6">
              <a href="#features" className="hidden md:inline text-sm font-bold text-architect-sub hover:text-architect-main transition-colors">Features</a>
              <a href="#workflow" className="hidden md:inline text-sm font-bold text-architect-sub hover:text-architect-main transition-colors">Workflow</a>
              <button onClick={handleStart} className="accent-bg text-white px-6 py-2.5 rounded-full text-sm font-black hover:opacity-90 transition-all btn-lift">
                시작하기
              </button>
            </div>
          </div>
        </nav>

        {/* Hero Section — Full-screen immersive */}
        <section className="landing-hero min-h-screen flex flex-col items-center justify-center px-10 pt-20 hero-grid-bg">
          <div className="max-w-[1000px] mx-auto text-center relative z-10">
            {/* Floating decorative elements */}
            <div className="absolute -top-16 -left-10 w-20 h-20 rounded-2xl border border-architect-border/30 bg-white/50 backdrop-blur-sm animate-float opacity-60 hidden lg:block" />
            <div className="absolute -top-8 -right-16 w-14 h-14 rounded-xl accent-bg opacity-10 animate-float-reverse hidden lg:block" />
            <div className="absolute bottom-10 -left-20 w-10 h-10 rounded-full border-2 border-architect-border/20 animate-float-reverse hidden lg:block" />

            <div className="animate-fade-up">
              <span className="inline-block px-4 py-1.5 rounded-full bg-white border border-architect-border text-[12px] font-bold text-architect-sub tracking-widest uppercase mb-10 shadow-sm">
                ✦ AI-Powered Architectural Visualization
              </span>
            </div>
            <h1 className="text-6xl sm:text-7xl md:text-[5.5rem] font-black tracking-tighter leading-[0.92] mb-8 animate-fade-up-delay-1">
              당신의 스케치가<br />
              <span className="relative">
                현실이 되는 순간
                <svg className="absolute -bottom-2 left-0 w-full h-3 accent-text opacity-20" viewBox="0 0 200 8" preserveAspectRatio="none">
                  <path d="M0 6 Q50 0 100 6 Q150 12 200 6" fill="none" stroke="currentColor" strokeWidth="3" />
                </svg>
              </span>
            </h1>
            <p className="text-xl md:text-2xl text-architect-sub font-medium max-w-2xl mx-auto mb-14 leading-relaxed animate-fade-up-delay-2">
              Gemini AI 기반 차세대 건축 렌더링 솔루션.<br className="hidden sm:inline" />
              스케치를 고화질 3D와 시네마틱 영상으로 변환합니다.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-5 animate-fade-up-delay-3">
              <button
                onClick={handleStart}
                className="group bg-architect-main text-white px-10 py-5 rounded-full text-base font-black uppercase tracking-widest flex items-center gap-4 hover:bg-black transition-all btn-glow btn-ripple shadow-xl shadow-architect-main/10"
              >
                렌더링 시작하기 <ArrowRight className="w-5 h-5 group-hover:translate-x-2 transition-transform" />
              </button>
              <a href="#features" className="text-sm font-bold text-architect-sub hover:text-architect-main transition-colors flex items-center gap-2 py-3">
                기능 살펴보기 ↓
              </a>
            </div>
          </div>

          {/* Scroll indicator */}
          <div className="absolute bottom-10 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 opacity-30">
            <div className="w-5 h-8 rounded-full border-2 border-architect-main flex items-start justify-center p-1">
              <div className="w-1 h-2 rounded-full bg-architect-main animate-bounce" />
            </div>
          </div>
        </section>

        {/* Stats Bar */}
        <section className="bg-white border-y border-architect-border py-12">
          <div className="max-w-[1100px] mx-auto px-10 grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            {[
              { num: '2K~4K', label: '초고해상도 출력' },
              { num: '10+', label: '건축 스타일' },
              { num: '8', label: '건물 유형 프리셋' },
              { num: '∞', label: '무한 편집 가능' },
            ].map((s, i) => (
              <div key={i} className={`animate-scale-reveal${i > 0 ? `-delay-${i}` : ''}`}>
                <div className="text-3xl md:text-4xl font-black stat-number mb-2">{s.num}</div>
                <div className="text-sm text-architect-sub font-bold uppercase tracking-wider">{s.label}</div>
              </div>
            ))}
          </div>
        </section>

        {/* Features Grid — Premium Cards */}
        <section id="features" className="py-32 bg-architect-bg">
          <div className="max-w-[1200px] mx-auto px-10">
            <div className="text-center mb-20">
              <span className="inline-block px-3 py-1 rounded-full text-[11px] font-bold accent-text uppercase tracking-widest mb-4">Core Features</span>
              <h2 className="text-4xl md:text-5xl font-black tracking-tighter">핵심 기능</h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {[
                { Icon: SketchIcon, title: 'Sketch to 3D', subtitle: 'AI 렌더링', desc: '컨셉 스케치를 사실적인 건축 렌더링으로 변환. 재질과 구조를 정밀하게 해석합니다.', tag: 'Gemini Flash' },
                { Icon: FilmIcon, title: 'Cinematic Tour', subtitle: '드론 영상', desc: '생성된 건물의 시네마틱 드론 투어 영상을 한 번의 클릭으로 제작합니다.', tag: 'Veo 3.1' },
                { Icon: MaterialIcon, title: 'Material Sim', subtitle: '재질 시뮬레이션', desc: '대리석, 콘크리트, 목재 등 재질을 실시간으로 교체해 즉각적인 피드백을 제공합니다.', tag: 'Real-time' },
              ].map(({ Icon, title, subtitle, desc, tag }) => (
                <div key={title} className="feature-card group">
                  <div className="flex items-center justify-between mb-6">
                    <div className="w-12 h-12 rounded-xl bg-architect-bg flex items-center justify-center group-hover:scale-110 transition-transform">
                      <Icon className="w-6 h-6 accent-text" />
                    </div>
                    <span className="text-[10px] font-bold accent-bg text-white px-2.5 py-1 rounded-full uppercase tracking-wider">{tag}</span>
                  </div>
                  <div className="text-sm accent-text font-bold uppercase tracking-wider mb-1">{subtitle}</div>
                  <h3 className="text-2xl font-black mb-4 tracking-tight">{title}</h3>
                  <p className="text-base text-architect-sub leading-relaxed font-medium">{desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Workflow Steps */}
        <section id="workflow" className="py-32 bg-white border-y border-architect-border">
          <div className="max-w-[1000px] mx-auto px-10">
            <div className="text-center mb-20">
              <span className="inline-block px-3 py-1 rounded-full text-[11px] font-bold accent-text uppercase tracking-widest mb-4">Simple Workflow</span>
              <h2 className="text-4xl md:text-5xl font-black tracking-tighter">3단계로 완성</h2>
            </div>
            <div className="space-y-0">
              {[
                { step: '01', title: '스케치 업로드', desc: '손 그림, CAD 도면, 이미지 파일을 드래그 앤 드롭으로 업로드하세요.', icon: '📐' },
                { step: '02', title: 'AI 렌더링', desc: '프리셋을 선택하거나 프롬프트를 직접 작성하여 원하는 스타일의 3D 렌더링을 생성합니다.', icon: '🏗️' },
                { step: '03', title: '편집 & 내보내기', desc: '건축 스타일, 재질, 각도를 변경하고 고해상도 이미지 또는 시네마틱 영상으로 내보냅니다.', icon: '🎬' },
              ].map(({ step, title, desc, icon }, i) => (
                <div key={step} className="flex items-start gap-8 py-10 group">
                  <div className="flex flex-col items-center flex-shrink-0">
                    <div className="w-14 h-14 rounded-2xl bg-architect-bg border border-architect-border flex items-center justify-center text-2xl group-hover:scale-110 transition-transform">
                      {icon}
                    </div>
                    {i < 2 && <div className="w-px h-full bg-architect-border mt-2 min-h-[40px]" />}
                  </div>
                  <div className="pt-2">
                    <div className="flex items-center gap-3 mb-2">
                      <span className="text-[12px] font-black accent-text uppercase tracking-widest">Step {step}</span>
                    </div>
                    <h3 className="text-2xl font-black tracking-tight mb-3">{title}</h3>
                    <p className="text-base text-architect-sub leading-relaxed font-medium max-w-lg">{desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA Section — Dark premium */}
        <section className="cta-section py-32 text-white">
          <div className="max-w-[800px] mx-auto px-10 text-center relative z-10">
            <div className="w-16 h-16 rounded-2xl bg-white/10 backdrop-blur-sm flex items-center justify-center mx-auto mb-8">
              <KeyIcon className="w-8 h-8 text-white/80" />
            </div>
            <h2 className="text-4xl md:text-5xl font-black tracking-tighter mb-6">Ready to Render?</h2>
            <p className="text-lg text-white/60 mb-12 font-medium leading-relaxed">
              Gemini API 키 하나로 모든 기능을 사용하세요.<br />
              지금 시작하면 무한한 건축 시각화를 경험할 수 있습니다.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-5">
              <button
                onClick={handleStart}
                className="group inline-flex items-center gap-4 accent-bg text-white px-10 py-5 rounded-full text-base font-black uppercase tracking-widest transition-all hover:opacity-90 btn-ripple shadow-2xl"
              >
                <LockIcon className="w-5 h-5" /> 인증하고 시작하기 <ArrowRight className="w-5 h-5 group-hover:translate-x-2 transition-transform" />
              </button>
            </div>
            <div className="mt-8">
              <a href="https://ai.google.dev/gemini-api/docs/billing" target="_blank" rel="noopener noreferrer" className="text-sm text-white/40 font-bold underline underline-offset-4 hover:text-white/70 transition-colors">
                Gemini API 키 발급 안내 →
              </a>
            </div>
          </div>
        </section>

        {/* Footer — Refined */}
        <footer className="bg-architect-main text-white/30 py-12 px-10">
          <div className="max-w-[1200px] mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <span className="text-sm font-black text-white/50 tracking-tighter">ARCHI RENDER</span>
              <span className="text-xs font-bold tracking-[0.3em] uppercase">&copy; 2026 NINETYNINE</span>
            </div>
            <div className="flex gap-8 text-xs font-bold uppercase tracking-widest">
              <a href="#" className="hover:text-white/60 transition-colors">Docs</a>
              <a href="#" className="hover:text-white/60 transition-colors">Support</a>
              <a href="#" className="hover:text-white/60 transition-colors">GitHub</a>
            </div>
          </div>
        </footer>

        {/* --- Authentication Modal --- */}
        {showAuthModal && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-[100] p-4" onClick={() => setShowAuthModal(false)}>
            <div
              className="bg-white rounded-lg shadow-2xl w-full max-w-md relative overflow-hidden"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Modal Header */}
              <div className="bg-architect-main text-white px-8 py-6 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <LockIcon className="w-6 h-6" />
                  <h3 className="text-lg font-black tracking-tight">인증</h3>
                </div>
                <button onClick={() => setShowAuthModal(false)} className="hover:opacity-60 transition-opacity">
                  <CloseIcon className="w-5 h-5" />
                </button>
              </div>

              {/* Auth Mode Tabs */}
              <div className="flex border-b border-architect-border">
                <button
                  onClick={() => { setAuthMode('password'); setAuthInput(''); setAuthError(null); }}
                  className={`flex-1 py-4 text-xs font-black uppercase tracking-widest transition-all ${authMode === 'password'
                    ? 'text-architect-main border-b-2 border-architect-main bg-architect-bg'
                    : 'text-architect-sub hover:text-architect-main'
                    }`}
                >
                  비밀번호 입력
                </button>
                <button
                  onClick={() => { setAuthMode('apikey'); setAuthInput(''); setAuthError(null); }}
                  className={`flex-1 py-4 text-xs font-black uppercase tracking-widest transition-all ${authMode === 'apikey'
                    ? 'text-architect-main border-b-2 border-architect-main bg-architect-bg'
                    : 'text-architect-sub hover:text-architect-main'
                    }`}
                >
                  API 키 직접 입력
                </button>
              </div>

              {/* Auth Content */}
              <div className="p-8 space-y-6">
                {authMode === 'password' ? (
                  <>
                    <p className="text-sm text-architect-sub font-medium leading-relaxed">
                      관리자에게 제공받은 비밀번호를 입력하세요.
                    </p>
                    <div className="relative">
                      <input
                        type={showPassword ? 'text' : 'password'}
                        value={authInput}
                        onChange={(e) => setAuthInput(e.target.value)}
                        onKeyDown={handleAuthKeyDown}
                        placeholder="비밀번호를 입력하세요"
                        className="w-full bg-architect-bg border border-architect-border rounded-custom px-4 py-4 text-sm outline-none focus:ring-2 focus:ring-architect-main focus:border-transparent transition-all pr-12"
                        autoFocus
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-architect-sub hover:text-architect-main transition-colors"
                      >
                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          {showPassword ? (
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3.98 8.223A10.477 10.477 0 001.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.45 10.45 0 0112 4.5c4.756 0 8.773 3.162 10.065 7.498a10.523 10.523 0 01-4.293 5.774M6.228 6.228L3 3m3.228 3.228l3.65 3.65m7.894 7.894L21 21m-3.228-3.228l-3.65-3.65m0 0a3 3 0 10-4.243-4.243m4.242 4.242L9.88 9.88" />
                          ) : (
                            <><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /></>
                          )}
                        </svg>
                      </button>
                    </div>
                  </>
                ) : (
                  <>
                    <p className="text-sm text-architect-sub font-medium leading-relaxed">
                      Google AI Studio에서 발급된 Gemini API 키를 직접 입력하세요.
                    </p>
                    <input
                      type="text"
                      value={authInput}
                      onChange={(e) => setAuthInput(e.target.value)}
                      onKeyDown={handleAuthKeyDown}
                      placeholder="AIza..."
                      className="w-full bg-architect-bg border border-architect-border rounded-custom px-4 py-4 text-sm font-mono outline-none focus:ring-2 focus:ring-architect-main focus:border-transparent transition-all"
                      autoFocus
                    />
                  </>
                )}

                {/* Error Message */}
                {authError && (
                  <div className="bg-red-50 border border-red-200 rounded-custom px-4 py-3 flex items-start gap-3">
                    <span className="text-red-500 text-lg leading-none">⚠</span>
                    <p className="text-sm text-red-600 font-medium">{authError}</p>
                  </div>
                )}

                {/* Submit Button */}
                <button
                  onClick={handleAuthSubmit}
                  disabled={!authInput.trim()}
                  className="w-full bg-architect-main text-white py-4 rounded-custom text-sm font-black uppercase tracking-widest hover:bg-black disabled:opacity-30 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-3"
                >
                  <ArrowRight className="w-4 h-4" /> 시작하기
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }

  // =============================================
  // TOOL VIEW
  // =============================================
  return (
    <div className="min-h-screen bg-architect-bg text-architect-main font-sans flex flex-col" data-accent={accentColor}>
      <header className="bg-white border-b border-architect-border px-8 py-5 flex items-center justify-between sticky top-0 z-50">
        <div className="flex items-center gap-8">
          <button onClick={() => setView('landing')} className="text-2xl font-black tracking-tighter hover:opacity-50 transition-all">ARCHI RENDER</button>
          <div className="hidden md:flex items-center gap-4">
            <span className="px-3 py-1 rounded-sm bg-architect-bg text-architect-sub text-[12px] font-bold border border-architect-border uppercase tracking-widest">ACTIVE SESSION</span>
            <p className="text-base text-architect-sub font-medium opacity-50 text-ellipsis overflow-hidden whitespace-nowrap max-w-[250px]">건축 시각화 전문가용 툴킷</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          {/* #8 Accent Color Picker */}
          <div className="hidden md:flex items-center gap-1.5 px-3 py-2 rounded-custom border border-architect-border bg-white">
            {ACCENT_COLORS.map(c => (
              <button
                key={c.id}
                onClick={() => setAccentColor(c.id)}
                className={`color-swatch ${accentColor === c.id ? 'active' : ''}`}
                style={{ backgroundColor: c.color }}
                title={c.name}
              />
            ))}
          </div>
          <button onClick={handleNewProject} className="flex items-center gap-2 px-4 py-2.5 rounded-custom border border-architect-border bg-white text-architect-main hover:bg-architect-bg transition-all text-sm font-black btn-lift">
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
            NEW PROJECT
          </button>
          <button onClick={handleExitTool} className="flex items-center gap-2 px-4 py-2.5 rounded-custom bg-architect-main text-white hover:bg-black transition-all text-sm font-black btn-lift">
            EXIT TOOL
          </button>
        </div>
      </header>

      <main className="grid grid-cols-1 lg:grid-cols-12 gap-8 p-8 max-w-[1700px] mx-auto w-full flex-grow">
        {/* Sidebar */}
        <aside className="lg:col-span-4 space-y-8 lg:max-h-[calc(100vh-100px)] lg:sticky lg:top-[85px] overflow-y-auto custom-scrollbar pr-3">
          {/* 01. File Upload with Drag & Drop */}
          <section className="bg-white border border-architect-border p-6 rounded-custom shadow-sm">
            <div className="flex items-center gap-3 mb-4">
              <span className="section-badge">01</span>
              <h3 className="text-sm font-black text-architect-sub uppercase tracking-widest">Sketch Upload</h3>
            </div>
            <div
              onClick={() => fileInputRef.current?.click()}
              onDragOver={handleDragOver}
              onDragEnter={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              className={`w-full cursor-pointer border border-dashed rounded-custom p-10 flex flex-col items-center justify-center text-center transition-all ${isDragOver
                ? 'bg-blue-50 border-blue-400 scale-[1.02]'
                : 'bg-architect-bg border-architect-border hover:bg-white hover:border-architect-main'
                }`}
            >
              {sketchPreview ? (
                <img src={sketchPreview} alt="Preview" className="max-h-40 rounded-sm" />
              ) : (
                <>
                  <SketchIcon className="w-8 h-8 text-architect-border mb-3" />
                  <span className="text-sm font-black text-architect-main uppercase tracking-widest">
                    {isDragOver ? 'Drop Here!' : 'Upload or Drag & Drop'}
                  </span>
                  <span className="text-[11px] text-architect-sub mt-2 font-medium">
                    최대 {MAX_FILE_SIZE_MB}MB · JPG, PNG, WEBP
                  </span>
                </>
              )}
            </div>
            <input ref={fileInputRef} type="file" className="hidden" accept="image/*" onChange={handleFileChange} />
          </section>

          {/* 02. Rendering Options + Prompt Editor */}
          <section className="bg-white border border-architect-border p-6 rounded-custom shadow-sm space-y-5">
            <div className="flex items-center gap-3 mb-2">
              <span className="section-badge">02</span>
              <h3 className="text-sm font-black text-architect-sub uppercase tracking-widest">Render Options</h3>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-[12px] font-bold text-architect-sub block mb-2 uppercase tracking-wider">Resolution</label>
                <select
                  value={resolution}
                  onChange={(e) => setResolution(e.target.value as ImageResolution)}
                  className="w-full bg-architect-bg border-none rounded-sm p-3 text-sm font-bold outline-none focus:ring-1 focus:ring-architect-main"
                >
                  {RESOLUTIONS.map(res => <option key={res} value={res}>{res} Ultra</option>)}
                </select>
              </div>
              <div>
                <label className="text-[12px] font-bold text-architect-sub block mb-2 uppercase tracking-wider">Aspect Ratio</label>
                <select
                  value={aspectRatio}
                  onChange={(e) => setAspectRatio(e.target.value as AspectRatio)}
                  className="w-full bg-architect-bg border-none rounded-sm p-3 text-sm font-bold outline-none focus:ring-1 focus:ring-architect-main"
                >
                  {ASPECT_RATIOS.map(ratio => <option key={ratio} value={ratio}>{ratio}</option>)}
                </select>
              </div>
            </div>
            {/* Render Presets */}
            <div>
              <label className="text-[12px] font-bold text-architect-sub block mb-2 uppercase tracking-wider">Building Type Preset</label>
              <div className="flex flex-wrap gap-1.5">
                {RENDER_PRESETS.map(preset => (
                  <button
                    key={preset.id}
                    onClick={() => setPrompt(preset.prompt)}
                    className={`px-2.5 py-1.5 rounded-sm text-[12px] font-bold transition-all border tag-btn ${prompt === preset.prompt
                      ? 'accent-bg text-white accent-border'
                      : 'bg-white text-architect-sub border-architect-border hover:border-architect-main hover:text-architect-main'
                      }`}
                    title={preset.prompt}
                  >
                    <span className="mr-1">{preset.emoji}</span>{preset.name}
                  </button>
                ))}
              </div>
            </div>
            {/* Prompt Editor */}
            <div>
              <label className="text-[12px] font-bold text-architect-sub block mb-2 uppercase tracking-wider">Render Prompt</label>
              <textarea
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                rows={3}
                className="w-full bg-architect-bg border-none rounded-sm p-4 text-sm text-architect-main outline-none focus:ring-1 focus:ring-architect-main resize-none"
                placeholder="렌더링 지시문을 입력하세요..."
              />
            </div>
          </section>

          {/* 03. Primary Actions */}
          <div className="grid grid-cols-1 gap-3">
            <button
              onClick={handleGenerate}
              disabled={isLoading || isVideoLoading || !sketchFile}
              className="bg-architect-main hover:bg-black disabled:opacity-20 text-white font-black py-5 px-8 rounded-custom transition-all text-base tracking-[0.2em] uppercase flex items-center justify-center gap-3 btn-lift btn-ripple"
            >
              <BuildingIcon className="w-5 h-5" /> {isLoading ? 'Processing...' : 'Generate 3D Render'}
            </button>
            <button
              onClick={handleGenerateCinematic}
              disabled={isLoading || isVideoLoading || !baseGeneratedImage}
              className="accent-bg disabled:opacity-20 text-white font-black py-5 px-8 rounded-custom transition-all text-base tracking-[0.2em] uppercase flex items-center justify-center gap-3 btn-lift btn-ripple"
            >
              {isVideoLoading ? 'Rendering Film...' : 'Cinematic Drone Tour'} <FilmIcon className="w-5 h-5" />
            </button>
          </div>

          {/* 04. Styles & Views */}
          <div className="bg-white border border-architect-border p-6 rounded-custom shadow-sm space-y-8">
            <div>
              <h4 className="text-[12px] font-black text-architect-sub mb-4 uppercase tracking-[0.2em]">Architectural Style</h4>
              <div className="flex flex-wrap gap-2">
                {ARCHITECTURAL_STYLES.map(style => (
                  <button
                    key={style.id}
                    onClick={() => handleStyleOrViewChange(style.prompt, 'style', style.name)}
                    disabled={!baseGeneratedImage}
                    className="bg-white border border-architect-border hover:border-architect-main px-3 py-1.5 rounded-sm text-[12px] font-bold text-architect-sub hover:text-architect-main transition-all disabled:opacity-20 tag-btn"
                  >
                    {style.name}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <h4 className="text-[12px] font-black text-architect-sub mb-4 uppercase tracking-[0.2em]">View Angles</h4>
              <div className="flex flex-wrap gap-2">
                {VIEW_ANGLES.map(angle => (
                  <button
                    key={angle.id}
                    onClick={() => handleStyleOrViewChange(angle.prompt, 'view', angle.name)}
                    disabled={!baseGeneratedImage}
                    className="bg-architect-bg border border-transparent hover:border-architect-main px-3 py-1.5 rounded-sm text-[12px] font-bold text-architect-sub hover:text-architect-main transition-all disabled:opacity-20 tag-btn"
                  >
                    {angle.name}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* 05. Material & Text Refinement */}
          <div className="bg-white border border-architect-border p-6 rounded-custom shadow-sm space-y-8">
            <div>
              <div className="flex items-center gap-3 mb-4">
                <span className="section-badge">05</span>
                <h4 className="text-[12px] font-black text-architect-sub uppercase tracking-[0.2em]">Material Refinement</h4>
              </div>
              <div className="grid grid-cols-2 gap-3 mb-3">
                <select value={selectedTarget} onChange={(e) => setSelectedTarget(e.target.value)} className="bg-architect-bg border-none rounded-sm p-3 text-sm font-bold outline-none">
                  <option value="floor">Floor</option>
                  <option value="exterior wall">Ext. Wall</option>
                  <option value="roof">Roof</option>
                  <option value="windows">Windows</option>
                  <option value="columns">Columns</option>
                </select>
                <select value={selectedMaterial} onChange={(e) => setSelectedMaterial(e.target.value)} className="bg-architect-bg border-none rounded-sm p-3 text-sm font-bold outline-none">
                  {MATERIALS.map(m => <option key={m.value} value={m.value}>{m.label}</option>)}
                </select>
              </div>
              <button onClick={handleMaterialSimulation} disabled={!baseGeneratedImage} className="w-full bg-architect-bg border border-architect-border hover:bg-white py-3 rounded-sm text-[12px] font-black uppercase tracking-widest transition-all disabled:opacity-30 btn-lift">Simulate Material</button>
            </div>

            <div>
              <h4 className="text-[12px] font-black text-architect-sub mb-3 uppercase tracking-[0.2em]">Custom Modification</h4>
              <textarea
                value={editPrompt}
                onChange={(e) => setEditPrompt(e.target.value)}
                rows={3}
                className="w-full bg-architect-bg border-none rounded-sm p-4 text-sm text-architect-main outline-none focus:ring-1 focus:ring-architect-main mb-3"
                placeholder="예: 통유리창으로 변경, 배경에 수영장 추가..."
              />
              <button onClick={handleTextEdit} disabled={!baseGeneratedImage || !editPrompt.trim()} className="w-full bg-architect-bg border border-architect-border hover:bg-white py-3 rounded-sm text-[12px] font-black uppercase tracking-widest transition-all disabled:opacity-30 btn-lift">
                Apply Edit
              </button>
            </div>
          </div>
        </aside>

        {/* Viewport */}
        <div className="lg:col-span-8 flex flex-col gap-6">
          <div className="bg-white border border-architect-border rounded-custom shadow-sm flex flex-col h-full min-h-[800px] overflow-hidden">
            <div className="flex-grow flex items-center justify-center bg-architect-bg/30 relative overflow-hidden">
              {/* #4 Loading with Progress Steps */}
              {(isLoading || isVideoLoading) && (
                <div className="absolute inset-0 bg-white/60 backdrop-blur-[2px] flex items-center justify-center z-10">
                  {/* Blurred sketch background during loading */}
                  {sketchPreview && (
                    <img src={sketchPreview} alt="" className="absolute inset-0 w-full h-full object-cover blur-xl opacity-10" />
                  )}
                  <div className="relative z-10">
                    {isVideoLoading ? <VideoLoadingSpinner /> : <LoadingSpinner />}
                  </div>
                </div>
              )}

              {error && (
                <div className="text-center p-10 max-w-md relative">
                  <button onClick={() => setError(null)} className="absolute top-2 right-2 text-architect-sub hover:text-architect-main transition-colors">
                    <CloseIcon className="w-4 h-4" />
                  </button>
                  <p className="accent-text font-black text-base mb-4 uppercase tracking-widest">Render Error</p>
                  <p className="text-base text-architect-sub font-medium mb-8 leading-relaxed">{error}</p>
                  {error.includes("API") && (
                    <button onClick={handleExitTool} className="px-8 py-3 bg-architect-main text-white text-sm font-bold uppercase tracking-widest rounded-custom btn-lift">키 재설정</button>
                  )}
                </div>
              )}

              {/* #3 Viewport Empty State — Architectural Wireframe */}
              {!isLoading && !isVideoLoading && !error && !displayedImage && !displayedVideo && (
                <div className="text-center wireframe-bg absolute inset-0 flex flex-col items-center justify-center">
                  <div className="relative">
                    <svg className="w-24 h-24 mx-auto mb-6 opacity-10" viewBox="0 0 100 100" fill="none" stroke="currentColor" strokeWidth="0.5">
                      <rect x="10" y="30" width="80" height="60" />
                      <line x1="10" y1="30" x2="50" y2="5" />
                      <line x1="90" y1="30" x2="50" y2="5" />
                      <rect x="25" y="45" width="15" height="20" />
                      <rect x="55" y="45" width="15" height="20" />
                      <rect x="38" y="60" width="18" height="30" />
                      <circle cx="50" cy="22" r="3" />
                    </svg>
                  </div>
                  <p className="text-sm font-black tracking-[0.3em] uppercase opacity-20">Viewport Standby</p>
                  <p className="text-[12px] mt-3 font-bold italic tracking-tighter opacity-15">Upload a sketch to begin</p>
                </div>
              )}

              {/* #3 Zoom lens on hover + #7 Info overlay */}
              {displayedVideo ? (
                <video src={displayedVideo} controls autoPlay loop className="max-w-full max-h-[750px] shadow-2xl rounded-sm" />
              ) : (
                displayedImage && (
                  <div className="relative info-overlay-parent">
                    <img src={displayedImage} alt="Render" className="max-w-full max-h-[750px] object-contain animate-[fadeIn_0.5s_ease-out] rounded-sm viewport-image" />
                    {/* #7 Rendering Info Overlay */}
                    <div className="info-overlay absolute bottom-0 left-0 right-0 px-4 py-3 rounded-b-sm flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <span className="text-[11px] text-white/80 font-bold uppercase tracking-wider">
                          {resolution} • {aspectRatio}
                        </span>
                        <span className="w-1 h-1 rounded-full bg-white/40"></span>
                        <span className="text-[11px] text-white/60 font-medium">Nano Banana 3 Pro</span>
                      </div>
                      <span className="accent-bg text-white text-[9px] font-black px-2 py-0.5 rounded-sm uppercase tracking-wider">AI Generated</span>
                    </div>
                  </div>
                )
              )}
            </div>

            {(displayedImage || displayedVideo) && !isLoading && !isVideoLoading && (
              <div className="p-6 border-t border-architect-border flex justify-between items-center bg-white">
                <div className="flex items-center gap-4">
                  <div className="flex flex-col">
                    <div className="text-[12px] font-black text-architect-sub uppercase tracking-[0.2em] opacity-40 mb-1">
                      Engine: {displayedVideo ? 'Veo 3.1' : 'Nano Banana 3 Pro'}
                    </div>
                    <div className="text-[11px] font-bold text-architect-sub uppercase tracking-widest">
                      Res: {resolution} • Ratio: {aspectRatio}
                    </div>
                  </div>
                  {/* Undo Button */}
                  {imageHistory.length >= 2 && !displayedVideo && (
                    <button
                      onClick={handleUndo}
                      className="flex items-center gap-1.5 px-3 py-2 rounded-custom border border-architect-border hover:bg-architect-bg transition-all text-[12px] font-black text-architect-sub uppercase tracking-wider"
                      title="이전 이미지로 되돌리기"
                    >
                      <UndoIcon className="w-3.5 h-3.5" /> Undo
                    </button>
                  )}
                </div>
                <button onClick={() => {
                  const link = document.createElement('a');
                  link.href = displayedVideo || displayedImage || "";
                  link.download = displayedVideo ? "render-cinematic.mp4" : `render-${resolution}.png`;
                  link.click();
                }} className="download-btn bg-architect-main text-white px-10 py-4 rounded-custom text-sm font-black tracking-widest uppercase hover:bg-black transition-all flex items-center gap-3 shadow-sm btn-lift btn-ripple">
                  <DownloadIcon className="w-4 h-4 download-icon" /> Download
                </button>
              </div>
            )}
          </div>

          {/* --- Image History Gallery --- */}
          {imageHistory.length > 0 && (
            <div className="bg-white border border-architect-border rounded-custom shadow-sm p-4">
              <div className="flex items-center justify-between mb-3">
                <h4 className="text-[12px] font-black text-architect-sub uppercase tracking-[0.2em]">
                  Render History ({imageHistory.indexOf(imageHistory.find(h => displayedImage === h.src)!) + 1}/{imageHistory.length})
                </h4>
                <button
                  onClick={() => setImageHistory([])}
                  className="text-[11px] font-bold text-architect-sub hover:text-architect-accent transition-colors uppercase tracking-wider"
                >
                  Clear All
                </button>
              </div>
              <div ref={galleryRef} className="flex gap-3 overflow-x-auto pb-2 custom-scrollbar">
                {imageHistory.map((item, idx) => (
                  <div
                    key={item.timestamp}
                    className={`flex-shrink-0 group relative rounded-sm overflow-hidden border-2 cursor-pointer gallery-thumb ${displayedImage === item.src && !displayedVideo
                      ? 'gallery-thumb-active'
                      : 'border-transparent hover:border-architect-main'
                      }`}
                    onClick={() => handleGalleryClick(item)}
                  >
                    <img
                      src={item.src}
                      alt={item.label}
                      className="w-24 h-24 object-cover"
                    />
                    <div className="absolute bottom-0 left-0 right-0 bg-black/60 px-1.5 py-1">
                      <p className="text-[9px] text-white font-bold truncate">{item.label}</p>
                    </div>
                    <div className="absolute top-0.5 left-1 text-[9px] font-black text-white bg-black/40 px-1 rounded-sm">
                      {idx + 1}
                    </div>
                    {/* Individual Download Button */}
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        const link = document.createElement('a');
                        link.href = item.src;
                        link.download = `render-${idx + 1}-${item.label.replace(/[^a-zA-Z0-9가-힣]/g, '_').substring(0, 20)}.png`;
                        link.click();
                      }}
                      className="absolute top-0.5 right-0.5 bg-black/60 hover:bg-architect-accent text-white p-1 rounded-sm opacity-0 group-hover:opacity-100 transition-all"
                      title="이미지 다운로드"
                    >
                      <DownloadIcon className="w-3 h-3" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </main>

      <footer className="bg-white border-t border-architect-border py-8 px-10 text-[12px] font-black text-architect-sub tracking-[0.3em] uppercase flex justify-between items-center">
        <div className="flex items-center gap-6">
          <span>&copy; 2026 NINETYNINE</span>
          <span className="text-architect-border">|</span>
          <span className="opacity-50">PRO ARCHITECTURAL TOOLS</span>
        </div>
        <div className="flex gap-12">
          <a href="#" className="hover:text-architect-main transition-colors">Docs</a>
          <a href="#" className="hover:text-architect-main transition-colors">Support</a>
        </div>
      </footer>
    </div>
  );
}
