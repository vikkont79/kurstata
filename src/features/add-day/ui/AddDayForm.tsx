'use client'

import { useEffect, useState } from 'react'
import { useForm, useFieldArray } from 'react-hook-form'
import { useRouter } from 'next/navigation'
import { zodResolver } from '@hookform/resolvers/zod'
import { toast } from 'sonner'
import { Button } from '@/shared/ui/button/Button'
import { Input } from '@/shared/ui/input/Input'
import { Label } from '@/shared/ui/label/Label'
import { ConfirmModal } from '@/shared/ui/confirm-modal/ConfirmModal'
import { formSchema, type FormValues } from '@/features/add-day/types'
import { saveDay } from '@/features/add-day/api/saveDay'
import { useDayDraft } from '@/features/add-day/lib'
import type { DayWithShifts } from '@/entities/day/types'

const resolver = zodResolver(formSchema)

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
  const router = useRouter()
  const identity = initialData?.date ?? 'new'
  const [deleteIndex, setDeleteIndex] = useState<number | null>(null)
  const [isResetOpen, setIsResetOpen] = useState(false)
  const [serverError, setServerError] = useState<string | null>(null)
  const isEditing = !!initialData
  const { draft, scheduleSave, flush, clearDraft } = useDayDraft(identity)

  const {
    register,
    handleSubmit,
    reset,
    getValues,
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

  useEffect(() => {
    if (draft) {
      reset(draft)
    }
  }, [draft, reset])

  useEffect(() => {
    return () => flush()
  }, [flush])

  useEffect(() => {
    const handlePageHide = () => flush()
    window.addEventListener('pagehide', handlePageHide)
    return () => window.removeEventListener('pagehide', handlePageHide)
  }, [flush])

  const handleFormChange = () => {
    scheduleSave(getValues())
  }

  const handleReset = () => {
    reset(getDefaultValues(initialData))
    clearDraft()
  }

  const onSubmit = async (data: FormValues) => {
    setServerError(null)

    try {
      const result = await saveDay(data)

      if (!result.success) {
        setServerError(result.error)
        toast.error('Ошибка сохранения')
        return
      }

      clearDraft()
      toast.success('Сохранено')
      router.push('/')
    } catch {
      setServerError('Не удалось сохранить данные')
      toast.error('Ошибка сохранения')
    }
  }

  return (
    <>
      <form
        noValidate
        onBlur={flush}
        onChange={handleFormChange}
        onSubmit={handleSubmit(onSubmit)}
        className="mx-auto flex w-full max-w-lg flex-col gap-6"
      >
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
              onClick={() => {
                append({ startTime: '', endTime: '', orders: 0 })
                scheduleSave(getValues())
              }}
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
                    {...register(`shifts.${index}.orders`, { valueAsNumber: true })}
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
            {...register('dayTotal', { valueAsNumber: true })}
          />
        </Label>

        {serverError && (
          <p className="rounded-lg border border-red-300 bg-red-50 px-3 py-2 text-sm text-red-600 dark:border-red-800 dark:bg-red-950 dark:text-red-400">
            {serverError}
          </p>
        )}

        <div className="flex gap-3">
          <Button type="submit" disabled={isSubmitting} className="flex-1">
            {isSubmitting ? 'Сохранение…' : 'Сохранить'}
          </Button>
          <Button type="button" variant="secondary" onClick={() => setIsResetOpen(true)}>
            Сбросить
          </Button>
        </div>
      </form>

      <ConfirmModal
        open={deleteIndex !== null}
        title="Удалить смену?"
        message="Это действие нельзя отменить."
        onConfirm={() => {
          if (deleteIndex !== null) {
            remove(deleteIndex)
            setDeleteIndex(null)
            scheduleSave(getValues())
          }
        }}
        onCancel={() => setDeleteIndex(null)}
      />

      <ConfirmModal
        open={isResetOpen}
        title="Сбросить данные?"
        message="Все введённые данные будут очищены."
        confirmLabel="Сбросить"
        onConfirm={() => {
          handleReset()
          setIsResetOpen(false)
        }}
        onCancel={() => setIsResetOpen(false)}
      />
    </>
  )
}

export { AddDayForm }
