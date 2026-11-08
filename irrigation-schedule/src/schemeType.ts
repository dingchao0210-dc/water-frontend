export interface ChapterDataType {
  areaCount: string
  irrigationArea: string
  wheatRatio: string
  fruitVegetableRatio: string
  otherCropRatio: string
  sandSoilWater: string
  loamSoilWater: string
  claySoilWater: string
  soilMoisture: string
  moistureEvaluate: string
  prioritySupplyArea: string
  dailyWaterNeed: string
  tenDaysWaterNeed: string
  yellowRiverRatio: string
  reservoirRatio: string
  groundWaterRatio: string
  mainGateCount: string
  controlGateCount: string
  keySupplyArea: string
}

export interface SchemeItem {
  id: number
  name: string
  startTime: string
  endTime: string
  catalog: Array<{
    id: number
    label: string
    targetPage?: number
    children?: any[]
  }>
}
