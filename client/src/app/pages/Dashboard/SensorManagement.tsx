import DeployedSensors from "../../../components/dashboard/SensorManagement/DeployedSensors"
import SectorAlphaTemp from "../../../components/dashboard/SensorManagement/SectorAlphaTemp"

const SensorManagement = () => {
  return (
    <div className="flex gap-6 ">
     <DeployedSensors />
     <SectorAlphaTemp />
    </div>
  )
}

export default SensorManagement
