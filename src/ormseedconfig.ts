import ormconfig from '@app/ormconfig';

const ormseedcondig = {
  ...ormconfig,
  migrations: [__dirname + '/seeds/*{.ts,.js}'],
  cli: {
    migrationsDir: 'src/seeds',
  },
};

export default ormseedcondig;
