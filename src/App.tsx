import { Card, CardContent, CardHeader, CardTitle } from "./components/ui/card"
import "./index.css"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "./components/ui/table"
import { Switch } from "./components/ui/switch"
import { useEffect, useState } from "react"
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "./components/ui/chart"
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, ResponsiveContainer } from "recharts"

type Site = {
  website: string;
  time: number,
  blocked: boolean;
};

function App() {
  const chartData = [
    { day: "Mon", hours: 5 },
    { day: "Tue", hours: 4 },
    { day: "Wed", hours: 6 },
    { day: "Thu", hours: 4 },
    { day: "Fri", hours: 7 },
    { day: "Sat", hours: 8 },
    { day: "Sun", hours: 6 },
  ]

  const [websites, setWebsites] = useState<Site[]>([])

  const formatTime = (seconds: number): string => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    if (hours > 0) {
      return `${hours}h ${minutes}m`;
    }
    return `${minutes}m ${secs}s`;
  };

  useEffect(() => {
    chrome.storage.sync.get("sites", (data) => {
      if (data.sites) {
        setWebsites(data.sites);
      }
    });
  }, []);

  const toggleBlocked = (index: number) => {
    const updatedSites = [...websites];
    updatedSites[index].blocked = !updatedSites[index].blocked;
    setWebsites(updatedSites)

    //setWebsites(prevWebsites =>
    //  prevWebsites.map((site, i) =>
    //    i === index ? { ...site, blocked: !site.blocked } : site
    //  )
    //)

    chrome.storage.sync.set({ sites: updatedSites }, () => {
      updateBlockingRules(updatedSites);
    });
    //chrome.storage.sync.get("sites", (data) => { console.log(data?.sites) })
  }

  const updateBlockingRules = (sites: Site[]) => {
    const blockedRules = sites
      .filter(site => site.blocked)
      .map((site, id) => ({
        id: id + 1,
        priority: 1,
        action: { type: chrome.declarativeNetRequest.RuleActionType.BLOCK },
        condition: {
          urlFilter: site.website,
          resourceTypes: [chrome.declarativeNetRequest.ResourceType.MAIN_FRAME]
        }
      }));

    chrome.declarativeNetRequest.getDynamicRules((existingRules) => {
      const existingRuleIds = existingRules.map(rule => rule.id);

      chrome.declarativeNetRequest.updateDynamicRules(
        { removeRuleIds: existingRuleIds, addRules: [] },
        () => {
          chrome.declarativeNetRequest.updateDynamicRules(
            { addRules: blockedRules },
            () => console.log("Blocking rules updated")
          );
        }
      );
    });

  };

  return (
    <div className="container mx-auto p-2 space-y-3 min-w-96">
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
              {websites.sort((a, b) => a.time > b.time ? -1 : 1).map((site, index) => (
                <TableRow key={site.website}>
                  <TableCell className="font-medium">
                    <div className="flex items-center space-x-2">
                      <img
                        src={`https://www.google.com/s2/favicons?domain=${site.website}&sz=32`}
                        alt={`${site.website} favicon`}
                        width={16}
                        height={16}
                        className="rounded-sm"
                      />
                      <span className="truncate w-[17ch]">{site.website}</span>
                    </div>
                  </TableCell>
                  <TableCell>{formatTime(site.time)}</TableCell>
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
