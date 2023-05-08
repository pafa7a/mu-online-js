import {Client} from '@elastic/elasticsearch';

const client = new Client({
  node: 'http://localhost:9200'
});

export default async function handler(req, res) {
  const {method} = req;

  switch (method) {
    case 'GET':
      await handleGet(req, res);
      break;
    case 'DELETE':
      await handleDelete(req, res);
      break;
    default:
      res.setHeader('Allow', ['GET', 'DELETE']);
      res.status(405).end(`Method ${method} Not Allowed`);
  }
}

const handleGet = async (req, res) => {
  const {app} = req.query;
  if (!app) {
    return res.status(404).json({
      message: 'Invalid app provided.'
    });
  }

  try {
    const result = await client.search({
      index: 'mu_logs',
      body: {
        query: {
          bool: {
            must: [{match: {app}}]
          }
        },
        sort: [{date: {order: 'desc'}}],
        size: 500
      }
    });

    const hits = result?.hits?.hits?.reverse();
    if (!hits) {
      return res.status(404).json({
        message: 'No logs found'
      });
    }

    return res.status(200).json(hits);
  } catch (error) {
    console.error('Error in handleGet:', error);
    return res.status(500).json({message: error?.message});
  }
};

const handleDelete = async (req, res) => {
  const {app} = req.query;
  if (!app) {
    return res.status(404).json({
      message: 'Invalid app provided.'
    });
  }

  try {
    await client.deleteByQuery({
      index: 'mu_logs',
      body: {
        query: {
          match: {app}
        }
      }
    });

    return res.status(204).json();
  } catch (error) {
    console.error('Error in handleDelete:', error);
    return res.status(500).json({message: error?.message});
  }
};
