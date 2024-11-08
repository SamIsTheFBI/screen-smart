import { Button } from "./components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "./components/ui/card"
import "./index.css"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "./components/ui/table"
import { Switch } from "./components/ui/switch"
import { useState } from "react"
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "./components/ui/chart"
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, ResponsiveContainer } from "recharts"

function App() {
  const test = async () => {
    let [tab] = await chrome.tabs.query({ active: true })
    chrome.scripting.executeScript({
      target: { tabId: tab.id! },
      func: () => {
        alert("Hey")
      }
    })
  }

  const chartData = [
    { day: "Mon", hours: 5 },
    { day: "Tue", hours: 4 },
    { day: "Wed", hours: 6 },
    { day: "Thu", hours: 4 },
    { day: "Fri", hours: 7 },
    { day: "Sat", hours: 8 },
    { day: "Sun", hours: 6 },
  ]

  const tableData = [
    { website: "youtube.com", time: "2h 15m", blocked: false },
    { website: "facebook.com", time: "1h 30m", blocked: true },
    { website: "twitter.com", time: "45m", blocked: false },
    { website: "instagram.com", time: "1h 10m", blocked: false },
    { website: "linkedin.com", time: "30m", blocked: false },
  ]

  const [websites, setWebsites] = useState(tableData)

  const toggleBlocked = (index: number) => {
    setWebsites(prevWebsites =>
      prevWebsites.map((site, i) =>
        i === index ? { ...site, blocked: !site.blocked } : site
      )
    )
  }

  console.log(websites)

  return (
    <div className="container mx-auto p-2 space-y-3 min-w-96">
      <Button className="hidden" onClick={() => test()}>Test this extension</Button>
      <Card className="shadow-none border-none">
        <CardHeader>
          <CardTitle>Screen Time Usage</CardTitle>
        </CardHeader>
        <CardContent>
          <ChartContainer
            config={{
              hours: {
                label: "Hours",
                color: "hsl(var(--chart-1))",
              },
            }}
            className="h-[150px]"
          >
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="day" />
                <YAxis />
                <ChartTooltip content={<ChartTooltipContent />} />
                <Bar dataKey="hours" fill="#7C3AED" />
              </BarChart>
            </ResponsiveContainer>
          </ChartContainer>
        </CardContent>
      </Card>
      <Card className="shadow-none border-none">
        <CardHeader>
          <CardTitle>Website Usage</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Website</TableHead>
                <TableHead>Time</TableHead>
                <TableHead>Block</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {websites.map((site, index) => (
                <TableRow key={site.website}>
                  <TableCell className="font-medium">
                    <div className="flex items-center space-x-2">
                      <img
                        src={`https://www.google.com/s2/favicons?domain=${site.website}&sz=32`}
                        alt={`${site.website} favicon`}
                        width={16}
                        height={16}
                        className="rounded-sm hidden"
                      />
                      <span>{site.website}</span>
                    </div>
                  </TableCell>
                  <TableCell>{site.time}</TableCell>
                  <TableCell>
                    <Switch
                      checked={site.blocked}
                      onCheckedChange={() => toggleBlocked(index)}
                      aria-label={`Block ${site.website}`}
                    />
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}

export default App
