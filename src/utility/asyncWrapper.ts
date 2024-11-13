type WrapperType<T> = (data: Partial<T>) => Promise<any>;

export const  asyncWrapper = async<T>(serviceFn: WrapperType<T>) => {
    return async (data: Partial<T>): Promise<any> => {
        try {
          const result = await serviceFn(data);
          return result;
        } catch (error) {
          throw new Error(`Error occurred in asyncWrapper: ${error.message}`);
        }
      };

};


