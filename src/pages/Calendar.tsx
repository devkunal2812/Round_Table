import { useState } from "react";
import { ChevronLeft, ChevronRight, Plus, Clock, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

const calendarEvents = [
  {
    id: 1,
    title: "Figma Fridays",
    time: "10:00 AM",
    duration: "2 hours",
    type: "meeting",
    attendees: 5,
    color: "bg-dot-purple"
  },
  {
    id: 2,
    title: "Design Review",
    time: "2:00 PM", 
    duration: "1 hour",
    type: "review",
    attendees: 3,
    color: "bg-dot-blue"
  },
  {
    id: 3,
    title: "Team Standup",
    time: "9:00 AM",
    duration: "30 mins",
    type: "standup",
    attendees: 8,
    color: "bg-dot-green"
  }
];

const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const months = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
];

export default function Calendar() {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(new Date().getDate());

  const getDaysInMonth = (date: Date) => {
    return new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
  };

  const getFirstDayOfMonth = (date: Date) => {
    return new Date(date.getFullYear(), date.getMonth(), 1).getDay();
  };

  const navigateMonth = (direction: 'prev' | 'next') => {
    setCurrentDate(prev => {
      const newDate = new Date(prev);
      if (direction === 'prev') {
        newDate.setMonth(prev.getMonth() - 1);
      } else {
        newDate.setMonth(prev.getMonth() + 1);
      }
      return newDate;
    });
  };

  const renderCalendar = () => {
    const daysInMonth = getDaysInMonth(currentDate);
    const firstDay = getFirstDayOfMonth(currentDate);
    const days = [];

    // Empty cells for days before month starts
    for (let i = 0; i < firstDay; i++) {
      days.push(
        <div key={`empty-${i}`} className="h-12 flex items-center justify-center">
        </div>
      );
    }

    // Days of the month
    for (let day = 1; day <= daysInMonth; day++) {
      const isSelected = day === selectedDate;
      const isToday = day === new Date().getDate() &&
        currentDate.getMonth() === new Date().getMonth() &&
        currentDate.getFullYear() === new Date().getFullYear();

      days.push(
        <div
          key={day}
          className={`h-12 flex items-center justify-center text-sm cursor-pointer rounded-lg transition-colors ${
            isSelected
              ? 'bg-primary text-primary-foreground font-semibold'
              : isToday
              ? 'bg-dot-blue/20 text-dot-blue font-semibold border border-dot-blue'
              : 'hover:bg-muted text-foreground'
          }`}
          onClick={() => setSelectedDate(day)}
        >
          {day}
        </div>
      );
    }

    return days;
  };

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h1 className="text-3xl font-bold text-foreground">Calendar</h1>
        <Button className="bg-gradient-primary text-white shadow-soft hover:shadow-lg transition-all duration-300">
          <Plus className="mr-2 h-4 w-4" />
          Schedule Meeting
        </Button>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Calendar */}
        <div className="lg:col-span-2">
          <Card className="bg-gradient-card shadow-card border-border/50">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-xl">
                  {months[currentDate.getMonth()]} {currentDate.getFullYear()}
                </CardTitle>
                <div className="flex gap-2">
                  <Button 
                    variant="outline" 
                    size="icon"
                    onClick={() => navigateMonth('prev')}
                  >
                    <ChevronLeft className="h-4 w-4" />
                  </Button>
                  <Button 
                    variant="outline" 
                    size="icon"
                    onClick={() => navigateMonth('next')}
                  >
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-7 gap-2 mb-4">
                {days.map(day => (
                  <div key={day} className="h-10 flex items-center justify-center text-sm font-medium text-muted-foreground">
                    {day}
                  </div>
                ))}
              </div>
              <div className="grid grid-cols-7 gap-2">
                {renderCalendar()}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Events Sidebar */}
        <div className="space-y-6">
          {/* Today's Events */}
          <Card className="bg-gradient-card shadow-card border-border/50">
            <CardHeader>
              <CardTitle className="text-lg">Today's Events</CardTitle>
              <p className="text-sm text-muted-foreground">
                {months[currentDate.getMonth()]} {selectedDate}, {currentDate.getFullYear()}
              </p>
            </CardHeader>
            <CardContent className="space-y-4">
              {calendarEvents.map((event) => (
                <div key={event.id} className="p-4 rounded-lg bg-muted/30 border border-border">
                  <div className="flex items-start justify-between mb-2">
                    <h4 className="font-medium">{event.title}</h4>
                    <div className={`w-3 h-3 rounded-full ${event.color}`}></div>
                  </div>
                  
                  <div className="space-y-2 text-sm text-muted-foreground">
                    <div className="flex items-center gap-2">
                      <Clock className="h-3 w-3" />
                      <span>{event.time} • {event.duration}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Users className="h-3 w-3" />
                      <span>{event.attendees} attendees</span>
                    </div>
                  </div>
                  
                  <div className="mt-3">
                    <Badge variant="outline" className="text-xs">
                      {event.type}
                    </Badge>
                  </div>
                </div>
              ))}
              
              <Button variant="outline" className="w-full">
                <Plus className="mr-2 h-4 w-4" />
                Add Event
              </Button>
            </CardContent>
          </Card>

          {/* Quick Actions */}
          <Card className="bg-gradient-card shadow-card border-border/50">
            <CardHeader>
              <CardTitle className="text-lg">Quick Actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Button variant="outline" className="w-full justify-start">
                📅 Schedule 1-on-1
              </Button>
              <Button variant="outline" className="w-full justify-start">
                🎯 Plan Sprint Review
              </Button>
              <Button variant="outline" className="w-full justify-start">
                ☕ Coffee Chat
              </Button>
              <Button variant="outline" className="w-full justify-start">
                🚀 Project Kickoff
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}