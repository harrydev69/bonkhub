"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  Calendar,
  Clock,
  MapPin,
  Users,
  ExternalLink,
  AlertCircle,
  RefreshCw,
  Plus,
  ChevronLeft,
  ChevronRight,
  Sparkles,
} from "lucide-react"
import { PornhubNavigation } from "@/components/pornhub-navigation"
import { PornhubHeader } from "@/components/pornhub-header"

interface Event {
  id: string
  title: string
  date: string
  time: string
  type: string
  location?: string
  description: string
  relevanceScore: number
  tags: string[]
  verified: boolean
  source: string
  externalId?: string
  attendees?: number
  link?: string
  isRecurring?: boolean
  recurrenceRule?: string
  createdAt: string
  updatedAt: string
}

export default function CalendarPage() {
  const [currentDate, setCurrentDate] = useState(new Date())
  const [selectedDate, setSelectedDate] = useState<Date | null>(null)
  const [events, setEvents] = useState<Event[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [lastUpdated, setLastUpdated] = useState<string | null>(null)
  const [showAddEventModal, setShowAddEventModal] = useState(false)
  const [filters, setFilters] = useState({
    verifiedOnly: false,
    type: "",
    tag: "",
  })

  const fetchEvents = async () => {
    try {
      setLoading(true)
      setError(null)

      const params = new URLSearchParams({
        verifiedOnly: filters.verifiedOnly.toString(),
        ...(filters.type && { type: filters.type }),
        ...(filters.tag && { tag: filters.tag }),
      })

      const response = await fetch(`/api/events?${params}`)
      if (!response.ok) {
        throw new Error(`Failed to fetch events: ${response.status}`)
      }

      const data = await response.json()
      const sortedEvents = (data.events || []).sort((a: Event, b: Event) => {
        return new Date(b.date).getTime() - new Date(a.date).getTime()
      })
      setEvents(sortedEvents)
      setLastUpdated(data.updatedAt)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to fetch events")
      console.error("Events fetch error:", err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchEvents()
    const interval = setInterval(fetchEvents, 10 * 60 * 1000)
    return () => clearInterval(interval)
  }, [filters])

  // Calendar navigation functions
  const goToPreviousMonth = () => {
    setCurrentDate((prev) => new Date(prev.getFullYear(), prev.getMonth() - 1, 1))
  }

  const goToNextMonth = () => {
    setCurrentDate((prev) => new Date(prev.getFullYear(), prev.getMonth() + 1, 1))
  }

  const goToToday = () => {
    const today = new Date()
    setCurrentDate(today)
    setSelectedDate(today)
  }

  // Get calendar data for current month
  const getCalendarDays = () => {
    const year = currentDate.getFullYear()
    const month = currentDate.getMonth()
    const firstDay = new Date(year, month, 1)
    const lastDay = new Date(year, month + 1, 0)
    const startDate = new Date(firstDay)
    startDate.setDate(startDate.getDate() - firstDay.getDay())

    const days = []
    const currentDateObj = new Date(startDate)

    while (currentDateObj <= lastDay || days.length < 42) {
      days.push(new Date(currentDateObj))
      currentDateObj.setDate(currentDateObj.getDate() + 1)
    }

    return days
  }

  const hasEventsOnDate = (date: Date) => {
    return events.some((event) => {
      const eventDate = new Date(event.date)
      return eventDate.toDateString() === date.toDateString()
    })
  }

  const getEventsForDate = (date: Date) => {
    return events.filter((event) => {
      const eventDate = new Date(event.date)
      return eventDate.toDateString() === date.toDateString()
    })
  }

  const formatDate = (date: Date) => {
    return date.toLocaleDateString("en-US", { month: "long", year: "numeric" })
  }

  const getEventTypeColor = (type: string) => {
    switch (type) {
      case "conference":
        return "bg-blue-500"
      case "workshop":
        return "bg-green-500"
      case "meetup":
        return "bg-purple-500"
      case "ama":
        return "bg-[#ff6b35]"
      case "contest":
        return "bg-pink-500"
      case "burning":
        return "bg-red-500"
      case "exchange":
        return "bg-yellow-500"
      case "nft":
        return "bg-indigo-500"
      case "governance":
        return "bg-teal-500"
      case "partnership":
        return "bg-cyan-500"
      case "presentation":
        return "bg-amber-500"
      case "competition":
        return "bg-rose-500"
      case "tournament":
        return "bg-violet-500"
      case "tutorial":
        return "bg-emerald-500"
      case "analysis":
        return "bg-sky-500"
      case "panel":
        return "bg-lime-500"
      case "community-call":
        return "bg-fuchsia-500"
      case "awards":
        return "bg-amber-600"
      default:
        return "bg-gray-500"
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-black text-white">
        <PornhubNavigation />
        <PornhubHeader />

        <div className="max-w-7xl mx-auto px-4 py-8">
          <div className="mb-8">
            <h1 className="text-4xl font-bold text-white mb-2">🔥 Hot BONK events Internationally</h1>
            <p className="text-gray-400">Loading BONK ecosystem events...</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="group/loading bg-gray-800 rounded-lg overflow-hidden animate-pulse hover:bg-gray-750 hover:shadow-[0_0_8px_rgba(255,107,53,0.2)] hover:scale-[1.01] transition-all duration-500 transform-gpu cursor-pointer">
                <div className="aspect-video bg-gray-700 transition-all duration-500 group-hover/loading:scale-105 group-hover/loading:shadow-[0_0_2px_rgba(255,107,53,0.1)]"></div>
                <div className="p-4">
                  <div className="h-4 bg-gray-700 rounded mb-2 transition-all duration-500 group-hover/loading:scale-105 group-hover/loading:shadow-[0_0_2px_rgba(255,107,53,0.1)]"></div>
                  <div className="h-3 bg-gray-700 rounded w-2/3 transition-all duration-500 group-hover/loading:scale-105 group-hover/loading:shadow-[0_0_2px_rgba(255,107,53,0.1)]"></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-black text-white">
        <PornhubNavigation />
        <PornhubHeader />

        <div className="max-w-7xl mx-auto px-4 py-8">
          <div className="text-center py-12">
            <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4 transition-all duration-500 hover:scale-110 hover:rotate-2 hover:drop-shadow-[0_0_4px_rgba(239,68,68,0.4)]" />
            <h2 className="text-2xl font-bold mb-2 transition-all duration-500 hover:text-red-400">Failed to load events</h2>
            <p className="text-gray-400 mb-6 transition-all duration-500 hover:text-gray-300">{error}</p>
            <Button onClick={fetchEvents} className="group/retry bg-[#ff6b35] hover:bg-[#ff6b35]/80 hover:scale-105 hover:shadow-[0_0_8px_rgba(255,107,53,0.3)] transition-all duration-500 transform-gpu">
              <RefreshCw className="w-4 h-4 mr-2 transition-all duration-500 group-hover/retry:scale-110 group-hover/retry:rotate-2" />
              Try again
            </Button>
          </div>
        </div>
      </div>
    )
  }

  const calendarDays = getCalendarDays()
  const selectedDateEvents = selectedDate ? getEventsForDate(selectedDate) : []

  return (
    <div className="min-h-screen bg-black text-white">
      <PornhubNavigation />
      <PornhubHeader />

      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="group/header mb-8 transition-all duration-500 hover:scale-[1.01] transform-gpu">
          <h1 className="text-4xl font-bold text-white mb-2 transition-all duration-500 group-hover/header:text-orange-400 group-hover/header:drop-shadow-[0_0_8px_rgba(255,107,53,0.4)]">
            🔥 Hot BONK events Internationally
          </h1>
          <p className="text-gray-400 transition-all duration-500 group-hover/header:text-gray-300">
            Stay updated with BONK ecosystem events, launches, and community activities. Let the dog run!
          </p>
        </div>

        <Card className="group/filters bg-gray-900 border-gray-800 mb-8 hover:shadow-[0_0_15px_rgba(255,107,53,0.2)] hover:border-orange-500/40 hover:scale-[1.01] transition-all duration-500 transform-gpu cursor-pointer">
          <CardHeader>
            <CardTitle className="text-[#ff6b35] flex items-center transition-all duration-500 group-hover/filters:text-orange-400">
              <Sparkles className="w-5 h-5 mr-2 transition-all duration-500 group-hover/filters:scale-110 group-hover/filters:rotate-2 group-hover/filters:drop-shadow-[0_0_4px_rgba(255,107,53,0.4)]" />
              Filters & Customization
            </CardTitle>
            <CardDescription className="text-gray-400 transition-all duration-500 group-hover/filters:text-gray-300">
              Refine your BONK event view
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1 transition-all duration-500 hover:text-gray-200">Verification</label>
                <select
                  value={filters.verifiedOnly.toString()}
                  onChange={(e) => setFilters((prev) => ({ ...prev, verifiedOnly: e.target.value === "true" }))}
                  className="group/select w-full p-2 bg-gray-800 border border-gray-700 rounded-md focus:border-[#ff6b35] text-white hover:border-orange-500/50 hover:shadow-[0_0_8px_rgba(255,107,53,0.2)] transition-all duration-500"
                >
                  <option value="false">All Events</option>
                  <option value="true">Verified Only</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1 transition-all duration-500 hover:text-gray-200">Event Type</label>
                <select
                  value={filters.type}
                  onChange={(e) => setFilters((prev) => ({ ...prev, type: e.target.value }))}
                  className="group/select w-full p-2 bg-gray-800 border border-gray-700 rounded-md focus:border-[#ff6b35] text-white hover:border-orange-500/50 hover:shadow-[0_0_8px_rgba(255,107,53,0.2)] transition-all duration-500"
                >
                  <option value="">All Types</option>
                  <option value="conference">Conference</option>
                  <option value="workshop">Workshop</option>
                  <option value="meetup">Meetup</option>
                  <option value="ama">AMA</option>
                  <option value="contest">Contest</option>
                  <option value="burning">Burning</option>
                  <option value="exchange">Exchange</option>
                  <option value="nft">NFT</option>
                  <option value="governance">Governance</option>
                  <option value="partnership">Partnership</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1 transition-all duration-500 hover:text-gray-200">Tag</label>
                <select
                  value={filters.tag}
                  onChange={(e) => setFilters((prev) => ({ ...prev, tag: e.target.value }))}
                  className="group/select w-full p-2 bg-gray-800 border border-gray-700 rounded-md focus:border-[#ff6b35] text-white hover:border-orange-500/50 hover:shadow-[0_0_8px_rgba(255,107,53,0.2)] transition-all duration-500"
                >
                  <option value="">All Tags</option>
                  <option value="BONK">BONK</option>
                  <option value="Solana">Solana</option>
                  <option value="Ecosystem">Ecosystem</option>
                  <option value="Community">Community</option>
                  <option value="DeFi">DeFi</option>
                  <option value="NFT">NFT</option>
                  <option value="Governance">Governance</option>
                </select>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          {/* Calendar */}
          <Card className="bg-gray-900 border-gray-800">
            <CardHeader>
              <CardTitle className="text-[#ff6b35] flex items-center justify-between">
                <span className="flex items-center">
                  <Calendar className="w-5 h-5 mr-2" />
                  Calendar
                </span>
                <div className="flex items-center space-x-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={goToPreviousMonth}
                    className="border-gray-700 hover:bg-gray-800 bg-transparent"
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={goToNextMonth}
                    className="border-gray-700 hover:bg-gray-800 bg-transparent"
                  >
                    <ChevronRight className="w-4 h-4" />
                  </Button>
                </div>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="mb-4 flex items-center justify-between">
                <h3 className="text-lg font-semibold text-white">{formatDate(currentDate)}</h3>
                <Button onClick={goToToday} size="sm" className="bg-[#ff6b35] hover:bg-[#ff6b35]/80">
                  Today
                </Button>
              </div>

              <div className="grid grid-cols-7 gap-1 mb-2">
                {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day) => (
                  <div key={day} className="p-2 text-center text-xs font-medium text-gray-400">
                    {day}
                  </div>
                ))}
              </div>

              <div className="grid grid-cols-7 gap-1">
                {calendarDays.map((date, index) => {
                  const isCurrentMonth = date.getMonth() === currentDate.getMonth()
                  const isToday = date.toDateString() === new Date().toDateString()
                  const isSelected = selectedDate && date.toDateString() === selectedDate.toDateString()
                  const hasEvents = hasEventsOnDate(date)

                  return (
                    <button
                      key={index}
                      onClick={() => setSelectedDate(date)}
                      className={`
                        p-2 text-xs rounded-md transition-all duration-200 hover:bg-[#ff6b35]/20
                        ${isCurrentMonth ? "text-white" : "text-gray-600"}
                        ${isToday ? "bg-[#ff6b35] text-white font-bold" : ""}
                        ${isSelected ? "ring-2 ring-[#ff6b35] ring-offset-2 ring-offset-gray-900" : ""}
                        ${hasEvents ? "font-semibold text-[#ff6b35]" : ""}
                      `}
                    >
                      {date.getDate()}
                      {hasEvents && <div className="w-1 h-1 bg-[#ff6b35] rounded-full mx-auto mt-1"></div>}
                    </button>
                  )
                })}
              </div>
            </CardContent>
          </Card>

          {/* Event List */}
          <Card className="bg-gray-900 border-gray-800">
            <CardHeader>
              <CardTitle className="text-white flex items-center justify-between">
                <span className="flex items-center">
                  <Calendar className="w-5 h-5 mr-2 text-[#ff6b35]" />
                  {selectedDate
                    ? `Events on ${selectedDate.toLocaleDateString("en-US", {
                        weekday: "long",
                        year: "numeric",
                        month: "long",
                        day: "numeric",
                      })}`
                    : "Upcoming BONK Events"}
                </span>
                <Button
                  onClick={() => setShowAddEventModal(true)}
                  size="sm"
                  className="group/add-event bg-gradient-to-r from-[#ff6b35] to-red-500 hover:from-[#ff6b35]/80 hover:to-red-500/80 hover:scale-105 hover:shadow-[0_0_8px_rgba(255,107,53,0.3)] transition-all duration-500 transform-gpu"
                >
                  <Plus className="w-4 h-4 mr-1 transition-all duration-500 group-hover/add-event:scale-110 group-hover/add-event:rotate-2" />
                  Add Event
                </Button>
              </CardTitle>
              <CardDescription className="text-gray-400">
                {selectedDate
                  ? `${selectedDateEvents.length} event${selectedDateEvents.length !== 1 ? "s" : ""} on this date`
                  : `${events.length} total events in the BONK ecosystem`}
              </CardDescription>
            </CardHeader>
            <CardContent className="max-h-96 overflow-y-auto">
              {(selectedDate ? selectedDateEvents : events).length > 0 ? (
                (selectedDate ? selectedDateEvents : events).map((event) => (
                  <div
                    key={event.id}
                    className="group/event mb-4 p-4 bg-gray-800 rounded-lg hover:bg-gray-700 hover:shadow-[0_0_8px_rgba(255,107,53,0.2)] hover:scale-[1.01] transition-all duration-500 transform-gpu cursor-pointer"
                  >
                    <div className="flex items-start justify-between mb-2">
                      <h4 className="font-semibold text-white transition-all duration-500 group-hover/event:text-orange-400">
                        {event.title}
                      </h4>
                      <div className="flex items-center space-x-2">
                        <Badge className={`${getEventTypeColor(event.type)} text-white border-0 transition-all duration-500 group-hover/event:scale-105 group-hover/event:shadow-[0_0_4px_rgba(255,107,53,0.2)]`}>
                          {event.type.replace("-", " ")}
                        </Badge>
                        {event.verified && (
                          <Badge className="bg-green-500 text-white border-0 transition-all duration-500 group-hover/event:scale-105 group-hover/event:shadow-[0_0_4px_rgba(34,197,94,0.3)]">
                            ✓ Verified
                          </Badge>
                        )}
                      </div>
                    </div>

                    <p className="text-gray-400 text-sm mb-3 transition-all duration-500 group-hover/event:text-gray-300">
                      {event.description}
                    </p>

                    <div className="flex items-center text-xs text-gray-500 space-x-4 mb-2">
                      <span className="flex items-center transition-all duration-500 group-hover/event:text-gray-400">
                        <Clock className="w-3 h-3 mr-1 transition-all duration-500 group-hover/event:scale-110 group-hover/event:rotate-2" />
                        {new Date(event.date).toLocaleDateString("en-US", {
                          weekday: "short",
                          month: "short",
                          day: "numeric",
                        })}{" "}
                        at {event.time}
                      </span>
                      {event.location && (
                        <span className="flex items-center transition-all duration-500 group-hover/event:text-gray-400">
                          <MapPin className="w-3 h-3 mr-1 transition-all duration-500 group-hover/event:scale-110 group-hover/event:rotate-2" />
                          {event.location}
                        </span>
                      )}
                      {event.attendees && (
                        <span className="flex items-center transition-all duration-500 group-hover/event:text-gray-400">
                          <Users className="w-3 h-3 mr-1 transition-all duration-500 group-hover/event:scale-110 group-hover/event:rotate-2" />
                          {event.attendees} attending
                        </span>
                      )}
                    </div>

                    <div className="flex flex-wrap gap-1 mb-3">
                      {event.tags.slice(0, 5).map((tag) => (
                        <span key={tag} className="group/tag px-2 py-1 bg-gray-700 text-gray-300 text-xs rounded hover:bg-gray-600 hover:text-gray-200 hover:scale-105 hover:shadow-[0_0_4px_rgba(255,107,53,0.2)] transition-all duration-500 transform-gpu cursor-pointer">
                          #{tag}
                        </span>
                      ))}
                      {event.tags.length > 5 && (
                        <span className="px-2 py-1 bg-gray-700 text-gray-300 text-xs rounded">
                          +{event.tags.length - 5} more
                        </span>
                      )}
                    </div>

                    <div className="flex items-center justify-between">
                      <span className="text-xs text-gray-500 capitalize transition-all duration-500 group-hover/event:text-gray-400">
                        {event.source}
                      </span>
                      <div className="flex items-center space-x-2">
                        {event.link && (
                          <Button size="sm" className="group/details bg-[#ff6b35] hover:bg-[#ff6b35]/80 text-white hover:scale-105 hover:shadow-[0_0_4px_rgba(255,107,53,0.3)] transition-all duration-500 transform-gpu">
                            <ExternalLink className="w-3 h-3 mr-1 transition-all duration-500 group-hover/details:scale-110 group-hover/details:rotate-2" />
                            Event Details
                          </Button>
                        )}
                        <Button
                          size="sm"
                          variant="outline"
                          className="group/calendar border-gray-700 hover:bg-gray-800 bg-transparent hover:scale-105 hover:shadow-[0_0_4px_rgba(255,107,53,0.2)] transition-all duration-500 transform-gpu"
                        >
                          Add to Calendar
                        </Button>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="group/empty text-center py-8 hover:shadow-[0_0_8px_rgba(255,107,53,0.2)] hover:scale-[1.01] transition-all duration-500 transform-gpu cursor-pointer">
                  <Calendar className="w-12 h-12 text-gray-600 mx-auto mb-4 transition-all duration-500 group-hover/empty:text-orange-400 group-hover/empty:scale-110" />
                  <h3 className="text-lg font-semibold text-gray-400 mb-2">
                    {selectedDate ? "No events on this date" : "No upcoming events found"}
                  </h3>
                  <p className="text-gray-500 text-sm">
                    {selectedDate
                      ? "Try selecting a different date or check back later for new events."
                      : "Check back soon for exciting BONK ecosystem events!"}
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <Card className="bg-gray-900 border-gray-800">
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-[#ff6b35] mb-1">{events.length}</div>
              <div className="text-sm text-gray-400">BONK ecosystem events</div>
            </CardContent>
          </Card>

          <Card className="bg-gray-900 border-gray-800">
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-green-500 mb-1">{events.filter((e) => e.verified).length}</div>
              <div className="text-sm text-gray-400">Quality assured</div>
            </CardContent>
          </Card>

          <Card className="bg-gray-900 border-gray-800">
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-blue-500 mb-1">
                {
                  events.filter((e) => {
                    const eventDate = new Date(e.date)
                    const now = new Date()
                    return eventDate.getMonth() === now.getMonth() && eventDate.getFullYear() === now.getFullYear()
                  }).length
                }
              </div>
              <div className="text-sm text-gray-400">Events this month</div>
            </CardContent>
          </Card>

          <Card className="bg-gray-900 border-gray-800">
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-purple-500 mb-1">{new Set(events.map((e) => e.type)).size}</div>
              <div className="text-sm text-gray-400">Different event types</div>
            </CardContent>
          </Card>
        </div>

        {lastUpdated && (
          <Card className="bg-gray-900 border-gray-800">
            <CardContent className="p-4 text-center">
              <p className="text-gray-500 text-sm mb-1">Last updated: {new Date(lastUpdated).toLocaleString()}</p>
              <p className="text-gray-400 text-xs">
                BONK ecosystem events are constantly updated with fresh community activities
              </p>
            </CardContent>
          </Card>
        )}

        {showAddEventModal && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <Card className="bg-gray-900 border-gray-800 w-full max-w-md mx-4">
              <CardHeader>
                <CardTitle className="text-[#ff6b35]">Add New BONK Event</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">Event Title</label>
                  <input className="w-full p-2 bg-gray-800 border border-gray-700 rounded-md focus:border-[#ff6b35] text-white" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">Date</label>
                  <input
                    type="date"
                    className="w-full p-2 bg-gray-800 border border-gray-700 rounded-md focus:border-[#ff6b35] text-white"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">Time</label>
                  <input
                    type="time"
                    className="w-full p-2 bg-gray-800 border border-gray-700 rounded-md focus:border-[#ff6b35] text-white"
                  />
                </div>
                <div className="flex space-x-2">
                  <Button className="flex-1 bg-[#ff6b35] hover:bg-[#ff6b35]/80">Add Event</Button>
                  <Button
                    variant="outline"
                    className="flex-1 border-gray-700 hover:bg-gray-800 bg-transparent"
                    onClick={() => setShowAddEventModal(false)}
                  >
                    Cancel
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  )
}
