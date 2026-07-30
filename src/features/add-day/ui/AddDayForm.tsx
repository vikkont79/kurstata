'use client'

import { useState } from 'react'
import { useForm, useFieldArray } from 'react-hook-form'
import type { Resolver } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { toast } from 'sonner'
import { Button } from '@/shared/ui/button/Button'
import { Input } from '@/shared/ui/input/Input'
import { Label } from '@/shared/ui/label/Label'
import { ConfirmModal } from '@/shared/ui/confirm-modal/ConfirmModal'
import { formSchema, type FormValues } from '@/features/add-day/types'
import { saveDay } from '@/features/add-day/api/saveDay'
import type { DayWithShifts } from '@/entities/day/types'

const resolver = zodResolver(formSchema) as unknown as Resolver<FormValues>

const today = () => new Date().toISOString().split('T')[0]

const getDefaultValues = (initialData: DayWithShifts | undefined): FormValues => {
  if (initialData) {
    return {
      date: initialData.date,
      dayTotal: initialData.dayTotal ?? 0,
      shifts: initialData.shifts.map(s => ({
        startTime: s.startTime,
        endTime: s.endTime,
        orders: s.orders,
      })),
    }
  }
  return { date: today(), shifts: [], dayTotal: 0 }
}

const AddDayForm = ({ initialData }: { initialData?: DayWithShifts }) => {
  const [deleteIndex, setDeleteIndex] = useState<number | null>(null)
  const isEditing = !!initialData

  const {
    register,
    handleSubmit,
    control,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({
    resolver,
    defaultValues: getDefaultValues(initialData),
  })

  const { fields, append, remove } = useFieldArray({
    control,
    name: 'shifts',
  })

  const onSubmit = async (data: FormValues) => {
    const formData = new FormData()
    formData.set('date', data.date)
    formData.set('dayTotal', String(data.dayTotal))
    formData.set('shifts', JSON.stringify(data.shifts))

    const result = await saveDay(formData)

    if (result.success) {
      toast.success('Сохранено')
    } else {
      toast.error(result.error)
    }
  }

  return (
    <>
      <form onSubmit={handleSubmit(onSubmit)} className="mx-auto flex w-full max-w-lg flex-col gap-6">
        <Label error={errors.date?.message}>
          Дата
          <Input type="date" hasError={!!errors.date} readOnly={isEditing} {...register('date')} />
        </Label>

        <div className="flex flex-col gap-3">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-zinc-700 dark:text-zinc-300">Смены</span>
            <Button
              type="button"
              variant="secondary"
              onClick={() => append({ startTime: '', endTime: '', orders: 0 })}
            >
              + Добавить смену
            </Button>
          </div>

          {errors.shifts?.root?.message && (
            <span className="text-xs text-red-500">{errors.shifts.root.message}</span>
          )}

          {fields.map((field, index) => {
            const shiftErrors = errors.shifts?.[index]

            return (
              <div
                key={field.id}
                className="flex flex-wrap items-end gap-3 rounded-lg border border-zinc-200 p-4 dark:border-zinc-700"
              >
                <Label
                  error={shiftErrors?.startTime?.message}
                  className="flex-1 min-w-[120px]"
                >
                  Начало
                  <Input
                    type="time"
                    hasError={!!shiftErrors?.startTime}
                    {...register(`shifts.${index}.startTime`)}
                  />
                </Label>

                <Label
                  error={shiftErrors?.endTime?.message}
                  className="flex-1 min-w-[120px]"
                >
                  Конец
                  <Input
                    type="time"
                    hasError={!!shiftErrors?.endTime}
                    {...register(`shifts.${index}.endTime`)}
                  />
                </Label>

                <Label
                  error={shiftErrors?.orders?.message}
                  className="w-24"
                >
                  Заказы
                  <Input
                    type="number"
                    min={0}
                    hasError={!!shiftErrors?.orders}
                    {...register(`shifts.${index}.orders`)}
                  />
                </Label>

                <Button
                  type="button"
                  variant="ghost"
                  className="mb-0.5"
                  onClick={() => setDeleteIndex(index)}
                >
                  ✕
                </Button>
              </div>
            )
          })}

          {!fields.length && (
            <p className="text-sm text-zinc-500">Смен пока нет. Добавьте хотя бы одну.</p>
          )}
        </div>

        <Label error={errors.dayTotal?.message}>
          Сумма за день
          <Input
            type="number"
            step="any"
            min={0}
            hasError={!!errors.dayTotal}
            {...register('dayTotal')}
          />
        </Label>

        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? 'Сохранение…' : 'Сохранить'}
        </Button>
      </form>

      <ConfirmModal
        open={deleteIndex !== null}
        title="Удалить смену?"
        message="Это действие нельзя отменить."
        onConfirm={() => {
          if (deleteIndex !== null) {
            remove(deleteIndex)
            setDeleteIndex(null)
          }
        }}
        onCancel={() => setDeleteIndex(null)}
      />
    </>
  )
}

export { AddDayForm }
