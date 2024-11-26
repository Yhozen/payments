import { handleErrors } from "@/utils";
import { registrySchema } from "@/commands/validations";
import { fetchRegistry } from "@/commands/utils";

export const getSubDependency = async (path: string) => {
  try {
    const response = await fetchRegistry([path]);
    return registrySchema.parse(response);
  } catch (error) {
    handleErrors("Failed to connect to the components library.");
    process.exit(0);
  }
};
