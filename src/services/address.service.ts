import { AnyCaaRecord } from "dns";
import Address from "../models/address.model";

class AddressService {

  async createAddress(userId: string, data: any) {

    if (!data.name || !data.mobile || !data.address) {
      throw { statusCode: 400, message: "Name, Mobile and Address are required" };
    }

    const address = await Address.create({
      ...data,
      user_id: userId,
    });

    return address;
  }

  async getAddresses(userId: string) {
    return await Address.findAll({
      where: { user_id: userId },
      order: [["createdAt", "DESC"]],
    });
  }

  async getAddressById(id: string) {
    const address = await Address.findByPk(id);

    if (!address) {
      throw { statusCode: 404, message: "Address not found" };
    }

    return address;
  }

  async updateAddress(id: string, data: any) {
    const address = await Address.findByPk(id);

    if (!address) {
      throw { statusCode: 404, message: "Address not found" };
    }

    await address.update(data);
    return address;
  }

  async deleteAddress(id: any) {
    const address = await Address.findByPk(id);

    if (!address) {
      throw { statusCode: 404, message: "Address not found" };
    }

    await address.destroy();

    return { message: "Address deleted successfully" };
  }
}

export default AddressService;