export const findOne = async ({
  model,
  filter,
  select = "",
  populate = [],
} = {}) => {
  return await model.findOne(filter).select(select).populate(populate);
};

export const findById = async ({
  model,
  id,
  select = "",
  populate = [],
} = {}) => {
  return await model.findById(id).select(select).populate(populate);
};

export const create = async ({ model, data = [{}], options = {} } = {}) => {
  return await model.create(data, options);
};

export const updateOne = async ({
  model,
  data = {},
  filter = {},
  options = {},
} = {}) => {
  return await model.updateOne(filter, data, options);
};


export const findOneAndUpdate = async ({
  model,
  data = {},
  filter = {},
  select = "",
  populate="",
  options = {runValidators:true,new:true},
}) => {
  return await model.findOneAndUpdate(
    filter,
    {
      ...data,
      $inc:{__v:1}
    },
    options
  ).select(select).populate(populate)
};