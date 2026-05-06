'use client'
import { useEffect, useState } from 'react'
import api from '@/lib/axios'
import DataTable, { Column } from '@/components/DataTable'
import type { Student, Assignment, Room, Dormitory } from '@/lib/types'

interface StudentProfile {
  student: Student
  assignments: Assignment[]
  rooms: Record<number, Room>
  dorms: Record<number, Dormitory>
}

export default function StudentsPage() {
  const [students, setStudents] = useState<Student[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [profile, setProfile] = useState<StudentProfile | null>(null)
  const [loadingProfile, setLoadingProfile] = useState(false)

  useEffect(() => {
    api.get<Student[]>('/students/').then(r => setStudents(r.data)).finally(() => setLoading(false))
  }, [])

  const openProfile = async (student: Student) => {
    setLoadingProfile(true)
    try {
      const [a, r, d] = await Promise.all([
        api.get<Assignment[]>('/assignments/'),
        api.get<Room[]>('/rooms/'),
        api.get<Dormitory[]>('/dormitories/'),
      ])
      const studentAssignments = a.data.filter(x => x.student_id === student.student_id)
      setProfile({
        student,
        assignments: studentAssignments,
        rooms: Object.fromEntries(r.data.map(x => [x.room_id, x])),
        dorms: Object.fromEntries(d.data.map(x => [x.dorm_id, x])),
      })
    } finally {
      setLoadingProfile(false)
    }
  }

  const filtered = students.filter(s =>
    !search ||
    s.full_name.toLowerCase().includes(search.toLowerCase()) ||
    s.email.toLowerCase().includes(search.toLowerCase()) ||
    (s.faculty ?? '').toLowerCase().includes(search.toLowerCase())
  )

  const columns: Column<Student>[] = [
    { header: 'ID',      accessor: 'student_id' },
    { header: 'Name',    accessor: 'full_name' },
    { header: 'Email',   accessor: 'email' },
    { header: 'Faculty', accessor: r => r.faculty ?? '—' },
    { header: 'Year',    accessor: r => r.year_of_study ?? '—' },
    { header: 'Gender',  accessor: r => <span className="capitalize">{r.gender ?? '—'}</span> },
    {
      header: 'Profile',
      accessor: r => (
        <button onClick={() => openProfile(r)} className="text-xs text-blue-600 hover:underline">
          View
        </button>
      ),
    },
  ]

  if (loading) return <p className="text-gray-400 animate-pulse">Loading…</p>

  return (
    <div>
      <div className="mb-4">
        <input
          type="text"
          placeholder="Search by name, email, or faculty…"
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="border border-gray-200 rounded-lg px-3 py-2 text-sm w-80 focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="px-5 py-4 border-b border-gray-50 flex items-center justify-between">
          <h2 className="font-semibold text-gray-900">Students</h2>
          <span className="text-sm text-gray-400">{students.length} total</span>
        </div>
        <DataTable columns={columns} data={filtered} keyExtractor={s => s.student_id} />
      </div>

      {profile && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl shadow-xl p-6 w-full max-w-lg mx-4 max-h-[80vh] overflow-y-auto">
            <div className="flex items-start justify-between mb-4">
              <div>
                <h3 className="font-semibold text-gray-900 text-lg">{profile.student.full_name}</h3>
                <p className="text-sm text-gray-400">{profile.student.email}</p>
              </div>
              <button onClick={() => setProfile(null)} className="text-gray-400 hover:text-gray-600 text-xl leading-none">×</button>
            </div>

            <div className="grid grid-cols-2 gap-3 text-sm mb-5">
              {[
                ['Faculty',      profile.student.faculty],
                ['Year',         profile.student.year_of_study],
                ['Gender',       profile.student.gender],
                ['National ID',  profile.student.national_id],
                ['Date of Birth',profile.student.date_of_birth],
                ['Phone',        profile.student.phone],
              ].map(([label, val]) => (
                <div key={label as string} className="bg-gray-50 rounded-lg p-3">
                  <span className="text-xs text-gray-400 block capitalize">{label}</span>
                  <span className="font-medium">{val ?? '—'}</span>
                </div>
              ))}
            </div>

            <h4 className="font-medium text-gray-800 mb-2">Assignment History ({profile.assignments.length})</h4>
            {profile.assignments.length === 0 ? (
              <p className="text-sm text-gray-400">No assignments.</p>
            ) : (
              <div className="space-y-2">
                {profile.assignments.map(a => {
                  const room = profile.rooms[a.room_id]
                  const dorm = room ? profile.dorms[room.dorm_id] : null
                  return (
                    <div key={a.assignment_id} className="border border-gray-100 rounded-lg p-3 text-sm">
                      <div className="flex justify-between">
                        <span className="font-medium">Room {room?.room_number ?? a.room_id} — {dorm?.name ?? ''}</span>
                        <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${a.status === 'active' ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 text-gray-600'}`}>
                          {a.status}
                        </span>
                      </div>
                      <div className="text-gray-400 mt-1">{a.check_in_date} → {a.check_out_date ?? 'present'}</div>
                    </div>
                  )
                })}
              </div>
            )}
          </div>
        </div>
      )}

      {loadingProfile && (
        <div className="fixed inset-0 bg-black/20 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 shadow-xl">
            <p className="text-gray-500 animate-pulse">Loading profile…</p>
          </div>
        </div>
      )}
    </div>
  )
}
