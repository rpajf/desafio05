import React, { Component } from 'react';
import { FaGithubAlt, FaPlus, FaSpinner } from 'react-icons/fa';
import { Link } from 'react-router-dom';
import api from '../../services/api';
import Container from '../../Components/Container/index';
import { Form, SubmitButton, List } from './styles';

export default class Main extends Component {
  state = {
    newRepo: '',
    repositories: [],
    loading: false,
    error: false,
  };

  componentDidMount() {
    // carregar os dados do LocaoStorage
    const repositories = localStorage.getItem('repositories');

    if (repositories) {
      // se forem encontrados repositories:
      this.setState({ repositories: JSON.parse(repositories) });
    }
  }

  componentDidUpdate(_, prevState) {
    // salvar os dados do localStorage
    const { repositories } = this.state;
    if (prevState.repositories !== repositories) {
      localStorage.setItem('repositories', JSON.stringify(repositories));
    }
  }

  handleInputChange = e => {
    this.setState({ newRepo: e.target.value });
    const { error } = this.state;
    if ({ error }) {
      this.setState({ error: false });
    }
  };

  handleSubmit = async e => {
    e.preventDefault();
    this.setState({ loading: true });

    try {
      const { newRepo, repositories } = this.state;
      const response = await api.get(`/repos/${newRepo}`);

      const data = {
        name: response.data.full_name,
      };

      repositories.map(rep => {
        if (rep.name === data.name) {
          throw new Error('Repositório duplicado');
        }
      });

      this.setState({
        repositories: [...repositories, data],
        /* toda vez que o user adicionar um
      repositório, um novo vetor é criado
      baseado no vetor que já existe de repositórios

       */
        newRepo: '',
        loading: false,
      });
    } catch (error) {
      console.log(error);
      this.setState({ error: true, loading: false });
    }
  };

  render() {
    const { newRepo, repositories, loading, error } = this.state;
    return (
      <Container>
        <h1>
          <FaGithubAlt />
          Repositórios
        </h1>

        <Form onSubmit={this.handleSubmit} error={error ? 1 : 0}>
          <input
            type="text"
            placeholder="Adicionar Repositório"
            value={newRepo}
            onChange={this.handleInputChange}
          />

          <SubmitButton loading={loading ? 1 : 0}>
            {loading ? (
              <FaSpinner color="#fff" size={14} />
            ) : (
              <FaPlus color="#fff" size={14} />
            )}
          </SubmitButton>
        </Form>

        <List>
          {repositories.map(repository => (
            <li key={repository.name}>
              <span>{repository.name}</span>
              <Link to={`/repository/${encodeURIComponent(repository.name)}`}>
                Detalhes
              </Link>
            </li>
          ))}
        </List>
      </Container>
    );
  }
}
