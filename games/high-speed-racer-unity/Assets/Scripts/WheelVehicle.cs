using UnityEngine;

namespace CityOfLegends
{
    [RequireComponent(typeof(Rigidbody), typeof(VehicleInput))]
    public sealed class WheelVehicle : MonoBehaviour
    {
        public WheelCollider frontLeft, frontRight, rearLeft, rearRight;
        public Transform frontLeftVisual, frontRightVisual, rearLeftVisual, rearRightVisual;
        public float motorTorque = 1150f;
        public float brakeTorque = 2600f;
        public float steerAngle = 30f;
        public float highSpeedSteerAngle = 10f;
        public float speedLimitKph = 155f;
        public float Condition { get; private set; } = 100f;
        public float SpeedKph => body == null ? 0f : body.linearVelocity.magnitude * 3.6f;

        private Rigidbody body;
        private VehicleInput controls;
        private float steer;
        private float lastImpact = -10f;

        private void Awake()
        {
            body = GetComponent<Rigidbody>();
            controls = GetComponent<VehicleInput>();
            body.mass = 1350f;
            body.centerOfMass = new Vector3(0, -0.35f, 0);
        }

        private void FixedUpdate()
        {
            if (!frontLeft || !frontRight || !rearLeft || !rearRight) return;
            float desired = Mathf.Lerp(steerAngle, highSpeedSteerAngle, Mathf.Clamp01(SpeedKph / speedLimitKph)) * controls.Steer;
            steer = Mathf.MoveTowards(steer, desired, 110f * Time.fixedDeltaTime);
            frontLeft.steerAngle = frontRight.steerAngle = steer;
            float motor = SpeedKph < speedLimitKph && controls.Brake < 0.1f ? controls.Throttle * motorTorque : 0f;
            rearLeft.motorTorque = rearRight.motorTorque = motor;
            float braking = controls.Brake * brakeTorque;
            frontLeft.brakeTorque = frontRight.brakeTorque = rearLeft.brakeTorque = rearRight.brakeTorque = braking;
        }

        private void Update()
        {
            SyncWheel(frontLeft, frontLeftVisual); SyncWheel(frontRight, frontRightVisual);
            SyncWheel(rearLeft, rearLeftVisual); SyncWheel(rearRight, rearRightVisual);
        }

        private static void SyncWheel(WheelCollider wheel, Transform visual)
        {
            if (!wheel || !visual) return;
            wheel.GetWorldPose(out Vector3 position, out Quaternion rotation);
            visual.SetPositionAndRotation(position, rotation);
        }

        private void OnCollisionEnter(Collision impact)
        {
            if (impact.relativeVelocity.magnitude < 3f || Time.time - lastImpact < 0.4f) return;
            lastImpact = Time.time;
            Condition = Mathf.Max(0, Condition - Mathf.Clamp(impact.relativeVelocity.magnitude * 0.35f, 1f, 12f));
            // Contact costs momentum but never ends the drive.
            body.linearVelocity *= 0.92f;
        }

        public void Recover(Vector3 position, Quaternion rotation)
        {
            body.linearVelocity = Vector3.zero;
            body.angularVelocity = Vector3.zero;
            body.position = position;
            body.rotation = rotation;
        }
    }
}
