import { FormProvider, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import preview from '../../../../../.storybook/preview';
import { ExerciseBlock } from './ExerciseBlock';
import { workoutFormSchema, type WorkoutFormValues } from '../../schemas';

const mockExercises = [
  { id: '1', name: 'ベンチプレス', description: null, body_part: 'chest', created_at: '', updated_at: '' },
  { id: '2', name: 'スクワット', description: null, body_part: 'legs', created_at: '', updated_at: '' },
];

function Wrapper({ children }: { children: React.ReactNode }) {
  const methods = useForm<WorkoutFormValues>({
    resolver: zodResolver(workoutFormSchema),
    defaultValues: {
      date: '2026-02-07',
      exerciseBlocks: [
        {
          exerciseId: '1',
          sets: [{ weight: 60, reps: 10 }, { weight: 65, reps: 8 }],
        },
      ],
    },
  });
  return <FormProvider {...methods}>{children}</FormProvider>;
}

const meta = preview.meta({
  component: ExerciseBlock,
  title: 'features/workout/ExerciseBlock',
  parameters: { layout: 'centered' },
  decorators: [
    (Story) => (
      <Wrapper>
        <div style={{ width: 600 }}>
          <Story />
        </div>
      </Wrapper>
    ),
  ],
});

export default meta;

export const Default = meta.story({
  args: {
    blockIndex: 0,
    exercises: mockExercises,
    onRemoveBlock: () => {},
  },
});
