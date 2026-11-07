using UnityEngine;

namespace CityOfLegends
{
    public sealed class ChaseCamera : MonoBehaviour
    {
        public Transform target;
        private void LateUpdate()
        {
            if (!target) return;
            Vector3 desired = target.position - target.forward * 8f + Vector3.up * 4f;
            transform.position = Vector3.Lerp(transform.position, desired, 1f - Mathf.Exp(-5f * Time.deltaTime));
            Quaternion facing = Quaternion.LookRotation(target.position + Vector3.up - transform.position, Vector3.up);
            transform.rotation = Quaternion.Slerp(transform.rotation, facing, 1f - Mathf.Exp(-7f * Time.deltaTime));
        }
    }
}
