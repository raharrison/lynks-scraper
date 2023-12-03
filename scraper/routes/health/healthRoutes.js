export const heartbeat = async (req, res) => {
  res.status(200).json({message: 'Up'});
};
