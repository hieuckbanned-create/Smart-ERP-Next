// Re-export everything from @smart-erp/shared for UI consistency
// All components should be imported from @smart-erp/shared going forward
export {
  Button,
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  Badge,
  DataTable,
  StatCard,
  PageHeader,
  Spinner,
  Toast,
  ToastContainer,
  ConfirmDialog,
} from '@smart-erp/shared';

export type { Column } from '@smart-erp/shared';
export { cn } from './utils/cn';
