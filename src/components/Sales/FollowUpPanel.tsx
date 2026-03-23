// 跟进提醒面板组件
import React, { useState, useEffect } from 'react'
import { Clock, CheckCircle, AlertCircle, Timer } from 'lucide-react'

interface FollowUpReminder {
  id: string
  wxid: string
  customerName: string
  reason: string
  suggestedTime: Date
  suggestedScript: string
  priority: 'high' | 'medium' | 'low'
  status: 'pending' | 'completed' | 'cancelled'
}

export const FollowUpPanel: React.FC = () => {
  const [reminders, setReminders] = useState<FollowUpReminder[]>([])
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    loadReminders()
    // 每分钟刷新一次
    const interval = setInterval(loadReminders, 60000)
    return () => clearInterval(interval)
  }, [])

  const loadReminders = async () => {
    try {
      const result = await window.electronAPI.sales.getPendingReminders()
      if (result.success && result.reminders) {
        setReminders(result.reminders.map((r: any) => ({
          ...r,
          suggestedTime: new Date(r.suggestedTime)
        })))
      }
    } catch (error) {
      console.error('加载提醒失败:', error)
    }
  }

  const handleComplete = async (id: string) => {
    try {
      await window.electronAPI.sales.completeReminder(id)
      await loadReminders()
    } catch (error) {
      console.error('完成提醒失败:', error)
    }
  }

  const handleSnooze = async (id: string, hours: number) => {
    try {
      await window.electronAPI.sales.snoozeReminder(id, hours)
      await loadReminders()
    } catch (error) {
      console.error('延后提醒失败:', error)
    }
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'text-red-600 bg-red-50'
      case 'medium': return 'text-yellow-600 bg-yellow-50'
      case 'low': return 'text-blue-600 bg-blue-50'
      default: return 'text-gray-600 bg-gray-50'
    }
  }

  const isOverdue = (time: Date) => time.getTime() < Date.now()

  return (
    <div className="follow-up-panel bg-white rounded-lg shadow p-4">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold flex items-center gap-2">
          <Clock className="w-5 h-5" />
          跟进提醒 ({reminders.length})
        </h3>
      </div>

      {reminders.length === 0 ? (
        <p className="text-gray-500 text-center py-8">暂无待跟进客户</p>
      ) : (
        <div className="space-y-3">
          {reminders.map((reminder) => (
            <div
              key={reminder.id}
              className={`border rounded-lg p-3 ${isOverdue(reminder.suggestedTime) ? 'border-red-300 bg-red-50' : 'border-gray-200'}`}
            >
              <div className="flex items-start justify-between mb-2">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-medium">{reminder.customerName}</span>
                    <span className={`text-xs px-2 py-0.5 rounded ${getPriorityColor(reminder.priority)}`}>
                      {reminder.priority === 'high' ? '高' : reminder.priority === 'medium' ? '中' : '低'}
                    </span>
                  </div>
                  <p className="text-sm text-gray-600 mb-1">{reminder.reason}</p>
                  <p className="text-xs text-gray-500 flex items-center gap-1">
                    {isOverdue(reminder.suggestedTime) && <AlertCircle className="w-3 h-3 text-red-500" />}
                    建议跟进时间: {reminder.suggestedTime.toLocaleString('zh-CN')}
                  </p>
                </div>
              </div>

              <div className="bg-blue-50 rounded p-2 mb-2">
                <p className="text-sm text-gray-700">{reminder.suggestedScript}</p>
              </div>

              <div className="flex gap-2">
                <button
                  onClick={() => handleComplete(reminder.id)}
                  className="flex-1 px-3 py-1.5 bg-green-500 text-white text-sm rounded hover:bg-green-600 flex items-center justify-center gap-1"
                >
                  <CheckCircle className="w-4 h-4" />
                  已完成
                </button>
                <button
                  onClick={() => handleSnooze(reminder.id, 2)}
                  className="px-3 py-1.5 bg-gray-200 text-gray-700 text-sm rounded hover:bg-gray-300 flex items-center gap-1"
                >
                  <Timer className="w-4 h-4" />
                  2小时后
                </button>
                <button
                  onClick={() => handleSnooze(reminder.id, 24)}
                  className="px-3 py-1.5 bg-gray-200 text-gray-700 text-sm rounded hover:bg-gray-300"
                >
                  明天
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
