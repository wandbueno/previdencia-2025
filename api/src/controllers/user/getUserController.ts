import { Request, Response } from 'express';
import { GetUserService } from '../../services/user/getUserService';

export class GetUserController {
  async handle(request: Request, response: Response) {
    try {
      const { id } = request.params;

      const getUserService = new GetUserService();
      const user = await getUserService.execute({ id });

      return response.json(user);
    } catch (error: any) {
      if (error instanceof Error) {
        return response.status(400).json({
          error: error.message
        });
      }

      return response.status(500).json({
        error: 'Internal server error'
      });
    }
  }
}
