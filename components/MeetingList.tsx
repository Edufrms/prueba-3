
import React from 'react';
import { Meeting, MeetingStatus } from '../types';

interface MeetingListProps {
  meetings: Meeting[];
  onSelectMeeting: (m: Meeting) => void;
}

const MeetingList: React.FC<MeetingListProps> = ({ meetings, onSelectMeeting }) => {
  const getStatusColor = (status: MeetingStatus) => {
    switch (status) {
      case MeetingStatus.SCHEDULED: return 'bg-blue-100 text-blue-700';
      case MeetingStatus.COMPLETED: return 'bg-green-100 text-green-700';
      case MeetingStatus.CANCELLED: return 'bg-red-100 text-red-700';
      default: return 'bg-slate-100 text-slate-700';
    }
  };

  if (meetings.length === 0) {
    return (
      <div className="text-center py-10 bg-slate-50 rounded-xl border border-dashed border-slate-300">
        <p className="text-slate-500">No hay reuniones agendadas todavía.</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {meetings.map((meeting) => (
        <div 
          key={meeting.id}
          onClick={() => onSelectMeeting(meeting)}
          className="bg-white border border-slate-200 p-4 rounded-xl flex items-center justify-between hover:border-indigo-300 transition-colors cursor-pointer group"
        >
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-indigo-50 rounded-full flex items-center justify-center text-xl text-indigo-600 font-bold">
              {meeting.contactName.charAt(0)}
            </div>
            <div>
              <h4 className="font-semibold text-slate-800">{meeting.contactName}</h4>
              <p className="text-sm text-slate-500">{meeting.company} • {meeting.time}</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(meeting.status)}`}>
              {meeting.status}
            </span>
            <span className="text-slate-300 group-hover:text-indigo-400">→</span>
          </div>
        </div>
      ))}
    </div>
  );
};

export default MeetingList;
