
import { ArchitecturalStyle, ViewAngle, ImageResolution, AspectRatio, MaterialOption, RenderPreset } from './types';

export const ARCHITECTURAL_STYLES: ArchitecturalStyle[] = [
  { id: 'modern', name: '모던', prompt: 'Apply a modern facade treatment to this building. Keep the exact same building shape, structure, proportions, and layout completely unchanged. Only modify the exterior skin with clean lines, flat surfaces, large glass panels, and minimal ornamentation.' },
  { id: 'gothic', name: '고딕', prompt: 'Apply a Gothic facade treatment to this building. Keep the exact same building shape, structure, proportions, and layout completely unchanged. Only modify the exterior skin with pointed arch window frames, Gothic tracery patterns, ornate stone carvings, and Gothic decorative elements on the surface.' },
  { id: 'classic', name: '클래식', prompt: 'Apply a Classical facade treatment to this building. Keep the exact same building shape, structure, proportions, and layout completely unchanged. Only modify the exterior skin with classical columns, cornices, pediments, symmetrical window arrangements, and Greco-Roman decorative moldings.' },
  { id: 'minimalism', name: '미니멀리즘', prompt: 'Apply a minimalist facade treatment to this building. Keep the exact same building shape, structure, proportions, and layout completely unchanged. Only modify the exterior skin with pure white or concrete surfaces, frameless windows, zero ornamentation, and clean material finishes.' },
  { id: 'surrealism', name: '초현실주의', prompt: 'Apply a surrealist facade treatment to this building. Keep the exact same building shape, structure, proportions, and layout completely unchanged. Only modify the exterior skin with dream-like textures, unexpected color combinations, melting or warped surface patterns, and surreal decorative elements.' },
  { id: 'brutalism', name: '브루탈리즘', prompt: 'Apply a Brutalist facade treatment to this building. Keep the exact same building shape, structure, proportions, and layout completely unchanged. Only modify the exterior skin with raw exposed concrete surfaces, board-formed concrete textures, deep-set windows, and heavy unfinished material finishes.' },
  { id: 'industrial', name: '인더스트리얼', prompt: 'Apply an Industrial facade treatment to this building. Keep the exact same building shape, structure, proportions, and layout completely unchanged. Only modify the exterior skin with exposed steel beams, metal cladding, visible rivets, corrugated metal panels, and brick surfaces.' },
  { id: 'bauhaus', name: '바우하우스', prompt: 'Apply a Bauhaus facade treatment to this building. Keep the exact same building shape, structure, proportions, and layout completely unchanged. Only modify the exterior skin with flat white walls, primary color accents, steel-frame windows in geometric grids, and functional material finishes.' },
  { id: 'art_deco', name: '아르데코', prompt: 'Apply an Art Deco facade treatment to this building. Keep the exact same building shape, structure, proportions, and layout completely unchanged. Only modify the exterior skin with geometric decorative patterns, chevron motifs, gold accent trim, sunburst designs, and streamlined ornamental details.' },
  { id: 'deconstructivism', name: '해체주의', prompt: 'Apply a Deconstructivist facade treatment to this building. Keep the exact same building shape, structure, proportions, and layout completely unchanged. Only modify the exterior skin with fragmented panel cladding, angular metal sheets, asymmetric window placements, and conflicting material textures.' },
];

export const VIEW_ANGLES: ViewAngle[] = [
  { id: 'front', name: '정면도', prompt: 'a straight-on front elevation view of the building' },
  { id: 'left', name: '좌측면도', prompt: 'a straight-on left side elevation view of the building' },
  { id: 'right', name: '우측면도', prompt: 'a straight-on right side elevation view of the building' },
  { id: 'rear', name: '배면도', prompt: 'a straight-on rear elevation view of the building' },
  { id: 'isometric', name: '아이소메트릭', prompt: 'an isometric view of the building from a high angle, showing the overall structure' },
  { id: 'perspective', name: '원근도', prompt: 'a realistic street-level perspective view of the building' },
];

export const RESOLUTIONS: ImageResolution[] = ['1K', '2K', '4K'];

export const ASPECT_RATIOS: AspectRatio[] = ['1:1', '16:9', '4:3', '3:4', '9:16'];

export const INITIAL_PROMPT = '이 스케치를 기반으로 주거용 건물의 사실적인 3D 렌더링을 만들어주세요.';

export const FLOOR_PLAN_PROMPT = '이 건물의 기준층에 대한 상세한 2D 건축 평면도를 만들어주세요. 가구, 문, 창문, 방 이름표를 포함해주세요.';

// Material options for simulation
export const MATERIALS: MaterialOption[] = [
  { value: 'marble texture', label: 'Marble' },
  { value: 'exposed concrete', label: 'Concrete' },
  { value: 'wood planks', label: 'Wood' },
  { value: 'brick wall', label: 'Brick' },
  { value: 'glass curtain wall', label: 'Glass' },
  { value: 'steel panels', label: 'Steel' },
];

// Rendering presets for different building types
export const RENDER_PRESETS: RenderPreset[] = [
  {
    id: 'residential',
    name: '주거용 건물',
    emoji: '🏠',
    prompt: '이 스케치를 기반으로 주거용 건물의 사실적인 3D 렌더링을 만들어주세요. 따뜻한 조명, 조경, 생활감 있는 디테일을 포함해주세요.',
  },
  {
    id: 'apartment',
    name: '아파트 단지',
    emoji: '🏢',
    prompt: '이 스케치를 기반으로 대규모 아파트 단지의 사실적인 3D 렌더링을 만들어주세요. 주차장, 조경, 커뮤니티 시설, 보행자 도로를 포함해주세요.',
  },
  {
    id: 'office',
    name: '상업용 오피스',
    emoji: '🏛️',
    prompt: '이 스케치를 기반으로 상업용 오피스 빌딩의 사실적인 3D 렌더링을 만들어주세요. 유리 커튼월, 로비 입구, 주변 도시 컨텍스트를 포함해주세요.',
  },
  {
    id: 'museum',
    name: '뮤지엄 / 갤러리',
    emoji: '🏛',
    prompt: '이 스케치를 기반으로 현대적인 미술관/갤러리의 사실적인 3D 렌더링을 만들어주세요. 자연 채광, 넓은 전시 공간, 조각적 외관을 표현해주세요.',
  },
  {
    id: 'cafe',
    name: '카페 / 레스토랑',
    emoji: '☕',
    prompt: '이 스케치를 기반으로 감각적인 카페/레스토랑의 사실적인 3D 렌더링을 만들어주세요. 테라스, 따뜻한 실내조명, 식물 데코, 아늑한 분위기를 표현해주세요.',
  },
  {
    id: 'school',
    name: '교육 시설',
    emoji: '🏫',
    prompt: '이 스케치를 기반으로 교육 시설의 사실적인 3D 렌더링을 만들어주세요. 밝은 교실, 넓은 복도, 운동장, 안전한 진입로를 포함해주세요.',
  },
  {
    id: 'church',
    name: '종교 시설',
    emoji: '⛪',
    prompt: '이 스케치를 기반으로 종교 시설의 사실적인 3D 렌더링을 만들어주세요. 높은 천장, 스테인드글라스, 자연광이 드리워지는 경건한 분위기를 표현해주세요.',
  },
  {
    id: 'warehouse',
    name: '물류 / 공장',
    emoji: '🏭',
    prompt: '이 스케치를 기반으로 물류창고 또는 공장 건물의 사실적인 3D 렌더링을 만들어주세요. 대형 도어, 적재 공간, 산업적 디테일을 포함해주세요.',
  },
];
