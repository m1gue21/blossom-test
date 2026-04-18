/**
 * Method decorator that prints execution time of the decorated method to the console.
 */
export function MeasureTime(
  _target: object,
  propertyKey: string,
  descriptor: PropertyDescriptor
): PropertyDescriptor {
  const originalMethod = descriptor.value;

  descriptor.value = async function (...args: unknown[]) {
    const start = Date.now();
    try {
      const result = await originalMethod.apply(this, args);
      const elapsed = Date.now() - start;
      console.log(`⏱  [${propertyKey}] executed in ${elapsed}ms`);
      return result;
    } catch (err) {
      const elapsed = Date.now() - start;
      console.log(`⏱  [${propertyKey}] failed after ${elapsed}ms`);
      throw err;
    }
  };

  return descriptor;
}
