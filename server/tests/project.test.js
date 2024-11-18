const { removeDuplicates } = require('../controllers/projectsControl');

describe('removeDuplicates', () => {
  it('deve remover itens duplicados com o mesmo _id', () => {
    const input = [
      { _id: '1', name: 'Project A' },
      { _id: '2', name: 'Project B' },
      { _id: '1', name: 'Project A (duplicate)' },
    ];

    const output = removeDuplicates(input);

    expect(output).toEqual([
      { _id: '1', name: 'Project A' },
      { _id: '2', name: 'Project B' },
    ]);
  });

  it('deve retornar um array vazio se a entrada for vazia', () => {
    const input = [];
    const output = removeDuplicates(input);
    expect(output).toEqual([]);
  });

  it('deve manter o array sem alteração se não houver duplicados', () => {
    const input = [
      { _id: '1', name: 'Project A' },
      { _id: '2', name: 'Project B' },
    ];

    const output = removeDuplicates(input);

    expect(output).toEqual(input);
  });
});