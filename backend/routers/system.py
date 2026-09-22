"""
System stats router — reads CPU usage, memory usage, and CPU temperature
directly from the Linux kernel's virtual filesystems (/proc, /sys).

This works inside Docker on a Raspberry Pi because containers share the
host kernel, so /proc/stat, /proc/meminfo, and the thermal_zone files are
all accessible without any extra privileges or volume mounts.
"""

import asyncio
import time
from fastapi import APIRouter, HTTPException
from pathlib import Path

router = APIRouter(prefix="/api/system", tags=["system"])

# ── CPU usage helpers ─────────────────────────────────────────────────────────

def _read_cpu_times() -> tuple[int, int]:
    """Return (idle, total) jiffies from the first line of /proc/stat."""
    stat = Path("/proc/stat").read_text()
    fields = stat.splitlines()[0].split()  # cpu  user nice system idle ...
    values = [int(x) for x in fields[1:]]
    idle = values[3]  # index 3 = idle, index 4 = iowait (excluded for simplicity)
    total = sum(values)
    return idle, total


async def _cpu_percent(interval: float = 0.25) -> float:
    """Measure CPU usage over a short sampling interval (non-blocking)."""
    idle1, total1 = _read_cpu_times()
    await asyncio.sleep(interval)
    idle2, total2 = _read_cpu_times()

    delta_total = total2 - total1
    delta_idle = idle2 - idle1

    if delta_total == 0:
        return 0.0
    return round((1 - delta_idle / delta_total) * 100, 1)


# ── Memory helpers ────────────────────────────────────────────────────────────

def _mem_percent() -> float:
    """Parse /proc/meminfo and return used memory as a percentage."""
    info: dict[str, int] = {}
    for line in Path("/proc/meminfo").read_text().splitlines():
        parts = line.split()
        if parts:
            key = parts[0].rstrip(":")
            val = int(parts[1]) if len(parts) > 1 else 0
            info[key] = val

    mem_total = info.get("MemTotal", 0)
    mem_available = info.get("MemAvailable", 0)

    if mem_total == 0:
        return 0.0
    used = mem_total - mem_available
    return round((used / mem_total) * 100, 1)


# ── Temperature helpers ───────────────────────────────────────────────────────

def _cpu_temp() -> float | None:
    """
    Try to read the CPU temperature from the thermal_zone sysfs entries.
    Returns degrees Celsius, or None if unavailable.

    Raspberry Pi typically exposes the SoC temperature at thermal_zone0.
    We iterate a few zones and pick the highest reading as a fallback.
    """
    thermal_base = Path("/sys/class/thermal")
    if not thermal_base.exists():
        return None

    temps: list[float] = []
    for zone in sorted(thermal_base.glob("thermal_zone*")):
        temp_file = zone / "temp"
        type_file = zone / "type"
        if not temp_file.exists():
            continue
        try:
            raw = int(temp_file.read_text().strip())
            # Values > 1000 are in milli-degrees Celsius
            celsius = raw / 1000 if raw > 1000 else float(raw)
            temps.append(celsius)
        except (ValueError, OSError):
            continue

    if not temps:
        return None
    return round(max(temps), 1)


# ── Route ─────────────────────────────────────────────────────────────────────

@router.get("")
async def get_system_stats():
    """
    Return current system resource usage for the Raspberry Pi host.

    Response fields:
    - cpu_percent  : 0–100 float
    - mem_percent  : 0–100 float
    - cpu_temp_c   : degrees Celsius float, or null if unreadable
    """
    try:
        cpu = await _cpu_percent(interval=0.25)
    except Exception:
        cpu = None

    try:
        mem = _mem_percent()
    except Exception:
        mem = None

    temp = _cpu_temp()

    return {
        "cpu_percent": cpu,
        "mem_percent": mem,
        "cpu_temp_c": temp,
    }
