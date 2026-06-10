// ============================================================
// src/utils/icons.js
// Centralized icon exports — only imports what we actually use
// ============================================================
// Importing from react-icons/fi loads the ENTIRE icon library.
// Re-exporting from here means we only reference what we need,
// which helps bundlers tree-shake unused icons.
// ============================================================

export {
  FiShield,
  FiFileText,
  FiSearch,
  FiHeart,
  FiChevronRight,
  FiChevronLeft,
  FiCopy,
  FiCheck,
  FiClock,
  FiMessageSquare,
  FiAlertTriangle,
  FiCheckCircle,
  FiEye,
  FiArrowLeft,
  FiRefreshCw,
  FiSend,
  FiGrid,
  FiLogOut,
  FiMenu,
  FiX,
  FiMail,
  FiLock,
  FiEyeOff,
  FiPhone,
  FiGlobe,
  FiChevronDown,
  FiChevronUp,
  FiMessageCircle
} from 'react-icons/fi';