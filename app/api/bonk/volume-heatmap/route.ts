import { NextResponse } from 'next/server';
import { CoinGecko } from '@/lib/services/coingecko';

export async function GET() {
  try {
    // Fetch 7 days of volume data from CoinGecko
    // Note: For Analyst plan, hourly data is automatically provided when days=7
    // (no need to specify interval parameter)
    const response = await CoinGecko.marketChart('bonk', {
      vs_currency: 'usd',
      days: 7
    });

    const volumes = response.total_volumes || [];
    
    // Debug: Log the raw data structure
    console.log(`[Volume Heatmap] Raw data: ${volumes.length} data points`);
    if (volumes.length > 0) {
      console.log(`[Volume Heatmap] Sample data:`, volumes.slice(0, 3));
      console.log(`[Volume Heatmap] Raw total volume: ${volumes.reduce((sum, [, vol]) => sum + vol, 0) / 1e9}B`);
      
      // Log sample data and time intervals
      console.log(`[Volume Heatmap] Sample data points:`, volumes.slice(0, 3).map(([ts, vol]) => ({
        timestamp: new Date(ts).toISOString(),
        volume: `${(vol / 1e6).toFixed(2)}M`
      })));
      
      // Calculate and log first few volume differences
      if (volumes.length > 1) {
        console.log(`[Volume Heatmap] First few volume differences:`);
        for (let i = 1; i < Math.min(volumes.length, 4); i++) {
          const [prevTs, prevVol] = volumes[i - 1];
          const [currTs, currVol] = volumes[i];
          const timeDiffHours = (currTs - prevTs) / (1000 * 60 * 60);
          const volumeDiff = currVol - prevVol;
          const hourlyRate = volumeDiff / timeDiffHours;
          console.log(`  ${i}: ${timeDiffHours.toFixed(2)}h, ${(volumeDiff / 1e6).toFixed(2)}M diff, ${(hourlyRate / 1e6).toFixed(2)}M/hour`);
        }
      }
    }
    
    // Process the data into our heatmap format
    const heatmapData = processVolumeData(volumes);
    
    // Calculate summary statistics
    const summary = calculateSummaryStats(volumes);
    
    // Debug: Log the processed summary
    console.log(`[Volume Heatmap] Processed summary:`, summary);
    
    return NextResponse.json({
      heatmap: heatmapData,
      summary: summary,
      lastUpdated: new Date().toISOString()
    }, { status: 200 });
    
  } catch (e: any) {
    console.error('Error in /api/bonk/volume-heatmap:', e);
    return NextResponse.json({ 
      error: e?.message ?? 'Failed to fetch volume data',
      fallback: generateFallbackData()
    }, { status: 500 });
  }
}

function processVolumeData(volumes: [number, number][]) {
  const days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
  const hours = Array.from({ length: 24 }, (_, i) => i.toString().padStart(2, "0"));
  
  // Calculate actual hourly trading volumes from cumulative data
  const hourlyVolumes: { [key: string]: { [key: string]: number[] } } = {};
  
  // Initialize the structure
  days.forEach(day => {
    hourlyVolumes[day] = {};
    hours.forEach(hour => {
      hourlyVolumes[day][hour] = [];
    });
  });
  
  // Calculate volume differences and normalize by time intervals
  for (let i = 1; i < volumes.length; i++) {
    const [prevTimestamp, prevVolume] = volumes[i - 1];
    const [currTimestamp, currVolume] = volumes[i];
    
    // Calculate time difference in hours
    const timeDiffHours = (currTimestamp - prevTimestamp) / (1000 * 60 * 60);
    
    // Calculate volume difference (actual trading volume in this period)
    const volumeDiff = Math.max(0, currVolume - prevVolume);
    
    // Normalize to hourly rate
    const hourlyVolume = volumeDiff / timeDiffHours;
    
    const prevDate = new Date(prevTimestamp);
    const day = days[prevDate.getDay()];
    const hour = prevDate.getHours().toString().padStart(2, "0");
    
    hourlyVolumes[day][hour].push(hourlyVolume);
  }
  
  // Convert to heatmap format with proper averaging
  return days.map(day => ({
    day,
    hours: hours.map(hour => {
      const hourVols = hourlyVolumes[day][hour];
      const volume = hourVols.length > 0 
        ? hourVols.reduce((sum, vol) => sum + vol, 0) / hourVols.length 
        : 0;
      const intensity = calculateIntensity(volume);
      
      return {
        hour,
        volume: Math.round(volume),
        intensity,
        timestamp: getTimestampForDayHour(day, hour)
      };
    })
  }));
}

function calculateIntensity(volume: number): number {
  // Convert volume to millions for easier calculation
  const volumeInMillions = volume / 1000000;
  
  // More realistic thresholds for BONK trading volume
  if (volumeInMillions >= 50) return 5;       // Very High: $50M+ per hour
  if (volumeInMillions >= 25) return 4;       // High: $25M+ per hour
  if (volumeInMillions >= 10) return 3;       // Medium: $10M+ per hour
  if (volumeInMillions >= 5) return 2;        // Low: $5M+ per hour
  return 1;                                    // Very Low: <$5M per hour
}

function getTimestampForDayHour(day: string, hour: string): number {
  const days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
  const dayIndex = days.indexOf(day);
  const hourNum = parseInt(hour);
  
  // Calculate timestamp for the current week
  const now = new Date();
  const currentDay = now.getDay();
  const daysDiff = dayIndex - currentDay;
  
  const targetDate = new Date(now);
  targetDate.setDate(now.getDate() + daysDiff);
  targetDate.setHours(hourNum, 0, 0, 0);
  
  return targetDate.getTime();
}

function calculateSummaryStats(volumes: [number, number][]) {
  if (volumes.length === 0) {
    return {
      totalVolume: 0,
      averagePerHour: 0,
      peakHour: "00:00 UTC",
      dataRange: "7 Days",
      updateFrequency: "Every 5 minutes"
    };
  }
  
  // Calculate total trading volume from volume differences
  let totalTradingVolume = 0;
  const hourlyVolumes: { [key: string]: number[] } = {};
  
  for (let i = 1; i < volumes.length; i++) {
    const [prevTimestamp, prevVolume] = volumes[i - 1];
    const [currTimestamp, currVolume] = volumes[i];
    
    // Calculate time difference in hours
    const timeDiffHours = (currTimestamp - prevTimestamp) / (1000 * 60 * 60);
    
    // Calculate volume difference (actual trading volume in this period)
    const volumeDiff = Math.max(0, currVolume - prevVolume);
    
    // Normalize to hourly rate
    const hourlyVolume = volumeDiff / timeDiffHours;
    
    totalTradingVolume += hourlyVolume;
    
    const prevDate = new Date(prevTimestamp);
    const hour = prevDate.getHours().toString().padStart(2, "0");
    
    if (!hourlyVolumes[hour]) {
      hourlyVolumes[hour] = [];
    }
    hourlyVolumes[hour].push(hourlyVolume);
  }
  
  // Calculate average per hour by dividing by 168 hours (7 days × 24 hours)
  const averagePerHour = totalTradingVolume / 168;
  
  // Find peak hour with highest average volume
  let maxAvgVolume = 0;
  let peakHour = "00:00 UTC";
  
  Object.entries(hourlyVolumes).forEach(([hour, hourVols]) => {
    const avgVolume = hourVols.reduce((sum, vol) => sum + vol, 0) / hourVols.length;
    if (avgVolume > maxAvgVolume) {
      maxAvgVolume = avgVolume;
      peakHour = `${hour}:00 UTC`;
    }
  });
  
  return {
    totalVolume: Math.round(totalTradingVolume),
    averagePerHour: Math.round(averagePerHour),
    peakHour,
    dataRange: "7 Days",
    updateFrequency: "Every 5 minutes"
  };
}

function generateFallbackData() {
  // Generate fallback data similar to the original mock data
  const days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
  const hours = Array.from({ length: 24 }, (_, i) => i.toString().padStart(2, "0"));
  
  const seed = 12345;
  let currentSeed = seed;
  
  const seededRandom = () => {
    currentSeed = (currentSeed * 9301 + 49297) % 233280;
    return currentSeed / 233280;
  };
  
  return {
    heatmap: days.map((day, dayIndex) => ({
      day,
      hours: hours.map((hour, hourIndex) => {
        const volumeSeed = (dayIndex * 24 + hourIndex) * seed;
        const volume = 200 + (volumeSeed % 800) + (seededRandom() * 200);
        const intensity = Math.floor((volumeSeed % 5) + 1);
        
        return {
          hour,
          volume: Math.round(volume),
          intensity,
        };
      }),
    })),
    summary: {
      totalVolume: 382080000000,
      averagePerHour: 529200000,
      peakHour: "15:00 UTC",
      dataRange: "7 Days",
      updateFrequency: "Every 5 minutes"
    }
  };
}
