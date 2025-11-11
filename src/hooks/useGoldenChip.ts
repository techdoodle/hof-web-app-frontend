/**
 * Hook to show golden chip notifications
 * 
 * Usage example:
 * ```tsx
 * import { useGoldenChip } from '@/hooks/useGoldenChip';
 * 
 * function MyComponent() {
 *   const { showNotification } = useGoldenChip();
 * 
 *   const handleMatchWin = () => {
 *     showNotification('Play a match and win 100 XP', 3000);
 *   };
 * 
 *   const handleGoalScore = () => {
 *     showNotification('Score a goal and earn: 100 XP', 3000);
 *   };
 * 
 *   return <button onClick={handleMatchWin}>Win Match</button>;
 * }
 * ```
 */

export { useGoldenChip } from '@/contexts/GoldenChipContext';

