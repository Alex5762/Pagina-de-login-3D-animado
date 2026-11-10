# Login interativo com mascotes animados

Protótipo de interface de login desenvolvido com React e TypeScript. O destaque é a interação entre o formulário e mascotes animados com efeitos de profundidade, que reagem ao movimento do ponteiro, ao foco dos campos e aos estados da interface.

## Funcionalidades demonstradas

- Layout responsivo com área de formulário e área de personagens.
- Mascotes com diferentes personalidades e padrões de animação.
- Olhos que acompanham o movimento do ponteiro.
- Reações ao foco nos campos de usuário e senha.
- Animações de piscar, respirar, movimentar-se e reagir a interações.
- Estados visuais para campos vazios e para a simulação de envio do formulário.

## Tecnologias

- React 19
- TypeScript
- Vite
- Tailwind CSS 4
- CSS animations

## Executar localmente

**Pré-requisito:** Node.js e npm.

```bash
npm install
npm run dev
```

O Vite disponibiliza o endereço local no terminal após iniciar o servidor de desenvolvimento.

## Comandos

```bash
npm run dev    # inicia o ambiente de desenvolvimento
npm run build  # gera a versão de produção em dist/
npm run preview # pré-visualiza o build local
npm run lint   # executa a verificação TypeScript (tsc --noEmit)
```

## Estrutura principal

```text
src/
  App.tsx       # formulário, mascotes, estados e animações
  main.tsx      # ponto de entrada React
  index.css     # estilos globais e Tailwind CSS
index.html      # documento HTML principal
vite.config.ts  # configuração do Vite
```

## Limites do protótipo

Este projeto demonstra uma experiência visual e interativa de login. **Não implementa autenticação real**: o formulário apenas verifica se os dois campos foram preenchidos e, nesse caso, apresenta uma animação de sucesso simulada. Não há validação de credenciais, integração com servidor, criação de sessão ou persistência de usuários.

Por isso, o formulário não deve ser utilizado para proteger contas ou acessar dados reais. O foco do projeto é estudar interface, estados de interação e animação de personagens.

---

Projeto experimental de estudo de desenvolvimento de interfaces.
